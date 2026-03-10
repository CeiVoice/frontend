import React, { useMemo } from 'react';

const SolvedFailedGraph = ({ myGroups = [] }) => {
    const dailyChartData = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 30 }, (_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (29 - i));
            const dateStr = d.toDateString();
            const solved = myGroups.filter(g => {
                if (g.status !== 'Solved') return false;
                const t = new Date(g.updatedAt);
                return !isNaN(t) && t.toDateString() === dateStr;
            }).length;
            const failed = myGroups.filter(g => {
                if (g.status !== 'Failed') return false;
                const t = new Date(g.updatedAt);
                return !isNaN(t) && t.toDateString() === dateStr;
            }).length;
            return { label: `${d.getMonth() + 1}/${d.getDate()}`, solved, failed };
        });
    }, [myGroups]);

    const chartW = 700, chartH = 160;
    const padL = 28, padR = 8, padT = 8, padB = 28;
    const plotW = chartW - padL - padR;
    const plotH = chartH - padT - padB;
    const maxVal = Math.max(1, ...dailyChartData.map(d => d.solved + d.failed));
    const groupW = plotW / 30;
    const bw = Math.max(2, groupW * 0.32);
    const yTicks = [0, Math.ceil(maxVal / 2), maxVal];

    return (
        <div className='bg-white shadow-sm p-6 border border-gray-200 rounded-2xl'>
            <h2 className='mb-1 font-bold text-gray-800 text-base'>Solved &amp; Failed — Last 30 Days</h2>
            <div className='flex items-center gap-4 mb-4 text-xs text-gray-500'>
                <span className='flex items-center gap-1.5'>
                    <span className='inline-block bg-green-400 rounded-sm w-3 h-3'></span>Solved
                </span>
                <span className='flex items-center gap-1.5'>
                    <span className='inline-block bg-red-400 rounded-sm w-3 h-3'></span>Failed
                </span>
            </div>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className='w-full' style={{ height: 180 }}>
                {/* Y-axis grid lines + labels */}
                {yTicks.map(v => {
                    const y = padT + plotH - (v / maxVal) * plotH;
                    return (
                        <g key={v}>
                            <line x1={padL} x2={chartW - padR} y1={y} y2={y}
                                stroke='#e5e7eb' strokeWidth='1' />
                            <text x={padL - 4} y={y + 4} textAnchor='end'
                                fontSize='9' fill='#9ca3af'>{v}</text>
                        </g>
                    );
                })}

                {/* Bars */}
                {dailyChartData.map((d, i) => {
                    const cx = padL + i * groupW + groupW / 2;
                    const solvedH = (d.solved / maxVal) * plotH;
                    const failedH = (d.failed / maxVal) * plotH;
                    const showLabel = i % 5 === 0 || i === 29;
                    return (
                        <g key={i}>
                            <rect x={cx - bw - 1} y={padT + plotH - solvedH}
                                width={bw} height={solvedH} fill='#4ade80' rx='2'>
                                <title>{d.label}: {d.solved} solved</title>
                            </rect>
                            <rect x={cx + 1} y={padT + plotH - failedH}
                                width={bw} height={failedH} fill='#f87171' rx='2'>
                                <title>{d.label}: {d.failed} failed</title>
                            </rect>
                            {showLabel && (
                                <text x={cx} y={chartH - 4} textAnchor='middle'
                                    fontSize='8.5' fill='#9ca3af'>{d.label}</text>
                            )}
                        </g>
                    );
                })}

                {/* X axis baseline */}
                <line x1={padL} x2={chartW - padR}
                    y1={padT + plotH} y2={padT + plotH}
                    stroke='#d1d5db' strokeWidth='1' />
            </svg>
        </div>
    );
};

export default SolvedFailedGraph;
