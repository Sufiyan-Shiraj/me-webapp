"use client";

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import clsx from 'clsx';
import { PieChart, BarChart2 } from 'lucide-react';

interface ChartProps {
    title: string;
    type: 'pie' | 'bar';
    data: { label: string; value: number; color: string }[];
}

export default function AnalyticsChart({ title, type, data }: ChartProps) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <Card className="h-full bg-white border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100">
                <h3 className="text-sm font-semibold tracking-tight text-foreground uppercase flex items-center gap-2">
                    {type === 'pie' ? <PieChart size={16} className="text-gray-900" /> : <BarChart2 size={16} className="text-gray-900" />}
                    {title}
                </h3>
            </CardHeader>
            <CardBody className="p-6">
                {type === 'pie' ? (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        {/* SVG Pie Chart */}
                        <div className="relative w-48 h-48 group">
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                {/* Fallback to CSS Conic Gradient for simplicity and performance */}
                                <foreignObject width="100" height="100">
                                    <div
                                        className="w-full h-full rounded-full"
                                        style={{
                                            background: `conic-gradient(${data.map((d, i, arr) => {
                                                const prev = arr.slice(0, i).reduce((sum, item) => sum + item.value, 0);
                                                const start = (prev / total) * 100;
                                                const end = ((prev + d.value) / total) * 100;
                                                return `${d.color} ${start}% ${end}%`;
                                            }).join(', ')})`,
                                            mask: 'radial-gradient(transparent 50%, black 51%)',
                                            WebkitMask: 'radial-gradient(transparent 50%, black 51%)'
                                        }}
                                    />
                                </foreignObject>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Total</span>
                                <span className="text-xl font-bold text-foreground">{total}</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-1 gap-3 w-full max-w-[200px]">
                            {data.map((item) => (
                                <div key={item.label} className="flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-gray-600 group-hover:text-foreground transition-colors font-medium">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-mono text-gray-500 font-medium">{Math.round((item.value / total) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-64 flex items-end justify-between gap-2 md:gap-4 p-4">
                        {/* Bar Chart */}
                        {data.map((item) => {
                            const height = (item.value / Math.max(...data.map(d => d.value))) * 100;
                            return (
                                <div key={item.label} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                    <div className="w-full relative flex-1 flex items-end rounded-t-lg bg-gray-100 overflow-hidden group-hover:bg-gray-200 transition-colors">
                                        <div
                                            className="w-full relative transition-all duration-300 ease-out rounded-t-lg group-hover:brightness-110"
                                            style={{
                                                height: `${height}%`,
                                                backgroundColor: item.color,
                                            }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded border border-gray-700 transition-opacity whitespace-nowrap z-10 shadow-sm">
                                                {item.value.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium rotate-0 truncate max-w-full text-center group-hover:text-foreground transition-colors">
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
