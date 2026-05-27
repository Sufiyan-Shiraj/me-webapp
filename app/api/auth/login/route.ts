import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { SignJWT } from 'jose';
import { UAParser } from 'ua-parser-js';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const rawIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
        const ip = rawIp.split(',')[0].trim();
        
        // Parse User Agent
        const parser = new UAParser(userAgent);
        const browserObj = parser.getBrowser();
        const osObj = parser.getOS();
        const deviceObj = parser.getDevice();

        let parsedDevice = 'Desktop';
        if (deviceObj.type === 'mobile' || deviceObj.type === 'tablet' || osObj.name === 'iOS' || osObj.name === 'Android') {
            parsedDevice = 'Mobile';
        }

        const browserString = browserObj.name 
            ? `${browserObj.name} ${browserObj.version ? browserObj.version.split('.')[0] : ''}`.trim() 
            : 'Unknown';

        // Fetch Location
        let locationStr = 'Unknown Location';
        try {
            if (ip && ip !== '127.0.0.1' && ip !== '::1') {
                const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.status === 'success') {
                        locationStr = `${geoData.city}, ${geoData.regionName}`;
                    }
                }
            } else {
                locationStr = 'Localhost';
            }
        } catch (e) {
            console.error("GeoIP error:", e);
        }
        
        // 1. Check for recent failed attempts from this IP to detect suspicious activity
        const { count: failedCount } = await supabaseAdmin
            .from('login_activity')
            .select('*', { count: 'exact', head: true })
            .eq('ip_address', ip)
            .eq('status', 'failed')
            .gt('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 mins

        const isSuspicious = (failedCount || 0) >= 3;

        // 2. Validate credentials
        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .ilike('username', username.trim())
            .eq('password', password.trim());

        if (error || !profiles || profiles.length === 0) {
            // Log failed login
            // Try to find the user_id if the username exists
            const { data: userRecord } = await supabaseAdmin.from('profiles').select('id').ilike('username', username.trim()).single();
            
            await supabaseAdmin.from('login_activity').insert({
                user_id: userRecord?.id,
                status: 'failed',
                ip_address: ip,
                device: parsedDevice,
                browser: browserString,
                location: locationStr,
                is_suspicious: isSuspicious
            });

            return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
        }

        const profile = profiles[0];

        // 3. Log successful login
        await supabaseAdmin.from('login_activity').insert({
            user_id: profile.id,
            status: 'success',
            ip_address: ip,
            device: parsedDevice,
            browser: browserString,
            location: locationStr,
            is_suspicious: isSuspicious
        });

        // 4. Sign a custom JWT
        const secret = process.env.SUPABASE_JWT_SECRET;
        if (!secret) {
            console.error('Missing SUPABASE_JWT_SECRET');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const secretKey = new TextEncoder().encode(secret);
        
        const token = await new SignJWT({
            role: 'authenticated', // This makes Supabase treat it as an authenticated request
            custom_user_id: profile.id
        })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 days expiration
        .sign(secretKey);

        const appUser = {
            id: profile.id,
            username: profile.username,
            name: profile.username,
            role: profile.role,
            avatar_url: `https://ui-avatars.com/api/?name=${profile.username}&background=random`,
            me: profile.me,
            mayfield: profile.mayfield,
        };

        return NextResponse.json({ token, user: appUser });

    } catch (err: any) {
        console.error('Login API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
