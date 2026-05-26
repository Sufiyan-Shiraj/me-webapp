"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ChartProps {
    title: string;
    type: 'pie' | 'bar';
    data: { label: string; value: number; color: string }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl p-3 border border-border shadow-2xl rounded-xl">
                <p className="text-sm font-semibold text-foreground mb-1">{label || payload[0].name}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: payload[0].payload.color || payload[0].fill }} />
                    <p className="text-sm text-foreground/70 font-medium">
                        Value: <span className="font-bold text-foreground">{payload[0].value.toLocaleString()}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default function AnalyticsChart({ title, type, data }: ChartProps) {
    const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <Card className="h-[380px] bg-surface/80 backdrop-blur-md border border-border shadow-sm flex flex-col hover:border-primary/40 transition-colors duration-300">
            <CardHeader className="border-b border-border bg-accent/5 px-6 py-4">
                <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <div className="p-1.5 bg-accent/10 rounded-md shadow-sm border border-border">
                        {type === 'pie' ? <PieChartIcon size={14} className="text-foreground/80" /> : <BarChart2 size={14} className="text-foreground/80" />}
                    </div>
                    {title}
                </h3>
            </CardHeader>
            <CardBody className="p-4 sm:p-6 flex-1 flex flex-col min-h-0">
                {type === 'pie' ? (
                    data.length > 0 ? (
                        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full h-full min-h-0">
                            <div className="w-full h-48 md:w-1/2 md:h-full relative flex items-center justify-center">
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                                    <span className="text-[10px] text-foreground/50 font-semibold uppercase tracking-widest">Total</span>
                                    <span className="text-xl font-bold text-foreground">{total.toLocaleString()}</span>
                                </div>
                                <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="label"
                                            stroke="none"
                                            onMouseEnter={(_, index) => setActiveIndex(index)}
                                            onMouseLeave={() => setActiveIndex(null)}
                                        >
                                            {data.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.color} 
                                                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                                                    style={{ transition: 'opacity 0.3s ease' }}
                                                    className="cursor-pointer"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="w-full md:w-1/2 flex flex-col gap-2.5 justify-start overflow-y-auto custom-scrollbar h-full max-h-[220px] pr-2 pb-2">
                                {data.map((item, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={item.label} 
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                        className={clsx(
                                            "flex items-center justify-between group cursor-default p-2 rounded-lg transition-all duration-300 shrink-0",
                                            activeIndex === idx ? "bg-accent/10 shadow-sm" : activeIndex === null ? "hover:bg-accent/5" : "opacity-40"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm transition-transform duration-300" style={{ backgroundColor: item.color, transform: activeIndex === idx ? 'scale(1.3)' : 'scale(1)' }} />
                                            <span className={clsx(
                                                "text-sm font-medium truncate max-w-[120px] transition-colors duration-300",
                                                activeIndex === idx ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                                            )}>{item.label}</span>
                                        </div>
                                        <span className={clsx(
                                            "text-sm font-mono font-semibold px-2 py-0.5 rounded-md shadow-sm transition-colors duration-300 border",
                                            activeIndex === idx ? "bg-accent text-white border-accent" : "text-foreground/60 bg-accent/5 border-border"
                                        )}>
                                            {total > 0 ? ((item.value / total) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0}%
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-foreground/40 text-sm">No data available</div>
                    )
                ) : (
                    <div className="w-full h-full min-h-0 flex-1">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="label" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }}
                                        tickFormatter={(value) => value > 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                                    />
                                    <Tooltip 
                                        content={<CustomTooltip />}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar 
                                        dataKey="value" 
                                        radius={[4, 4, 0, 0]} 
                                        barSize={32}
                                        animationDuration={1500}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex-1 h-full flex items-center justify-center text-foreground/40 text-sm">No data available</div>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
