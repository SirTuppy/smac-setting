import React, { forwardRef } from 'react';
import { WSPGymData } from '../../../types';

interface WSPPrintContainerProps {
    gymName: string;
    data: WSPGymData & { dateRange: string };
    updateCell: (gymName: string, rowId: string, field: string, value: string) => void;
    updateList: (gymName: string, listType: 'generalNotes' | 'settersChoice', index: number, value: string) => void;
    addListNote: (gymName: string, listType: 'generalNotes' | 'settersChoice', afterIndex: number) => void;
}

export const WSPPrintContainer = forwardRef<HTMLDivElement, WSPPrintContainerProps>(({
    gymName,
    data,
    updateCell,
    updateList,
    addListNote
}, ref) => {
    return (
        <div
            ref={ref}
            style={{
                maxWidth: 900,
                margin: '0 auto',
                backgroundColor: '#ffffff',
                padding: '60px 50px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                minHeight: 1100,
                fontFamily: "'Aptos', Calibri, sans-serif",
                position: 'relative',
            }}
        >
            {/* Logo */}
            <div style={{ marginBottom: 40 }}>
                <img
                    src="/smac-setting/assets/logoLong.png"
                    alt="Movement Logo"
                    style={{ width: 300, height: 'auto' }}
                />
            </div>

            {/* Header Row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '3px solid #009CA6',
                paddingBottom: 10,
                marginBottom: 20,
                fontSize: '14pt',
                fontWeight: 800,
                color: '#00205B',
                flexWrap: 'wrap',
                gap: 6,
            }}>
                <span>Weekly Setting Plan</span>
                <span>|</span>
                <span
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    style={{ outline: 'none', cursor: 'text' }}
                >{gymName}</span>
                <span>|</span>
                <span
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    style={{ outline: 'none', cursor: 'text' }}
                >{data.dateRange}</span>
            </div>

            {/* Subtitle */}
            <div style={{
                color: '#666666',
                fontSize: '10pt',
                fontWeight: 700,
                marginBottom: 30,
                lineHeight: 1.5,
            }}>
                The schedule and details below are intended to be shared with the Routesetting, Front Desk and Marketing<br />
                Teams. This is an internal document only and should not be community facing.
            </div>

            {/* Schedule Table */}
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: 10,
            }}>
                <thead>
                    <tr>
                        <th style={{ width: '10%', border: '1px solid #d3d3d3', padding: '15px 10px', textAlign: 'center', color: '#666666', fontWeight: 800, textTransform: 'capitalize', fontSize: '10.5pt', backgroundColor: 'white' }}></th>
                        <th style={{ width: '25%', border: '1px solid #d3d3d3', padding: '15px 10px', textAlign: 'center', color: '#666666', fontWeight: 800, textTransform: 'capitalize', fontSize: '10.5pt', backgroundColor: 'white' }}>Setters</th>
                        <th style={{ width: '15%', border: '1px solid #d3d3d3', padding: '15px 10px', textAlign: 'center', color: '#666666', fontWeight: 800, textTransform: 'capitalize', fontSize: '10.5pt', backgroundColor: 'white' }}>Boulders /<br />ropes</th>
                        <th style={{ width: '25%', border: '1px solid #d3d3d3', padding: '15px 10px', textAlign: 'center', color: '#666666', fontWeight: 800, textTransform: 'capitalize', fontSize: '10.5pt', backgroundColor: 'white' }}>zones</th>
                        <th style={{ width: '25%', border: '1px solid #d3d3d3', padding: '15px 10px', textAlign: 'center', color: '#666666', fontWeight: 800, textTransform: 'capitalize', fontSize: '10.5pt', backgroundColor: 'white' }}>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row: any, rowIdx: number) => {
                        const rowBg = rowIdx % 2 === 0 ? '#f5f5f5' : '#ffffff';
                        const cellStyle: React.CSSProperties = {
                            border: '1px solid #d3d3d3',
                            padding: '15px 10px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            color: '#666666',
                            fontWeight: 600,
                            fontSize: '10pt',
                        };
                        return (
                            <tr key={row.id} style={{ backgroundColor: rowBg }}>
                                <td style={{ ...cellStyle, fontWeight: 700 }}>{row.day}</td>
                                <td style={cellStyle}>
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        spellCheck={false}
                                        style={{ outline: 'none', minHeight: 20, cursor: 'pointer' }}
                                        onBlur={(e) => updateCell(gymName, row.id, 'setters', e.currentTarget.textContent || '')}
                                    >{row.setters}</div>
                                </td>
                                <td style={cellStyle}>
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        spellCheck={false}
                                        style={{ outline: 'none', minHeight: 20, cursor: 'pointer' }}
                                        onBlur={(e) => updateCell(gymName, row.id, 'type', e.currentTarget.textContent || '')}
                                    >{row.type}</div>
                                </td>
                                <td style={cellStyle}>
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        spellCheck={false}
                                        style={{ outline: 'none', minHeight: 20, cursor: 'pointer' }}
                                        onBlur={(e) => updateCell(gymName, row.id, 'zones', e.currentTarget.textContent || '')}
                                    >{row.zones}</div>
                                </td>
                                <td style={cellStyle}>
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        spellCheck={false}
                                        style={{ outline: 'none', minHeight: 20, cursor: 'pointer' }}
                                        onBlur={(e) => updateCell(gymName, row.id, 'notes', e.currentTarget.textContent || '')}
                                    >{row.notes}</div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Table Footer */}
            <div style={{
                backgroundColor: '#f0f0f0',
                color: '#888888',
                fontStyle: 'italic',
                fontSize: '8pt',
                padding: '8px 15px',
                fontWeight: 600,
                marginBottom: 40,
            }}>
                Schedule is subject to change based on unforeseen circumstances.
            </div>

            {/* GENERAL NOTES */}
            <div style={{ marginBottom: 40 }}>
                <div style={{
                    color: '#009CA6',
                    fontSize: '14pt',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: 15,
                    letterSpacing: 0.5,
                }}>GENERAL NOTES</div>
                <ul style={{
                    paddingLeft: 20,
                    listStyleType: 'none',
                    color: '#666666',
                    fontSize: '10pt',
                    fontWeight: 600,
                    lineHeight: 1.6,
                    minHeight: 30,
                    margin: 0,
                }}>
                    {data.generalNotes.map((note: string, idx: number) => (
                        <li
                            key={`gn-${idx}-${data.generalNotes.length}`}
                            style={{
                                position: 'relative',
                                marginBottom: 8,
                                paddingLeft: 2,
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                left: -15,
                                color: '#009CA6',
                                fontWeight: 'bold',
                                fontSize: 18,
                                lineHeight: 1,
                                top: -1,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            }}>›</span>
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                spellCheck={false}
                                ref={(el) => {
                                    if (el && el.textContent !== note) {
                                        el.textContent = note;
                                    }
                                }}
                                onBlur={(e) => {
                                    const text = e.currentTarget.textContent || '';
                                    updateList(gymName, 'generalNotes', idx, text);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const text = e.currentTarget.textContent || '';
                                        updateList(gymName, 'generalNotes', idx, text);
                                        addListNote(gymName, 'generalNotes', idx);
                                        setTimeout(() => {
                                            const li = e.currentTarget.closest('li');
                                            const nextLi = li?.nextElementSibling;
                                            if (nextLi) {
                                                const editableSpan = nextLi.querySelector('[contenteditable]') as HTMLElement;
                                                if (editableSpan) editableSpan.focus();
                                            }
                                        }, 50);
                                    }
                                }}
                                style={{
                                    outline: 'none',
                                    display: 'inline-block',
                                    minWidth: 100,
                                    minHeight: 16,
                                    cursor: 'text',
                                    padding: '0 2px',
                                    borderRadius: 2,
                                }}
                            />
                        </li>
                    ))}
                </ul>
            </div>

            {/* SETTER'S CHOICE */}
            <div style={{ marginBottom: 40 }}>
                <div style={{
                    color: '#009CA6',
                    fontSize: '14pt',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: 15,
                    letterSpacing: 0.5,
                }}>SETTER'S CHOICE</div>
                <ul style={{
                    paddingLeft: 20,
                    listStyleType: 'none',
                    color: '#666666',
                    fontSize: '10pt',
                    fontWeight: 600,
                    lineHeight: 1.6,
                    minHeight: 30,
                    margin: 0,
                }}>
                    {data.settersChoice.map((note: string, idx: number) => (
                        <li
                            key={`sc-${idx}-${data.settersChoice.length}`}
                            style={{
                                position: 'relative',
                                marginBottom: 8,
                                paddingLeft: 2,
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                left: -15,
                                color: '#009CA6',
                                fontWeight: 'bold',
                                fontSize: 18,
                                lineHeight: 1,
                                top: -1,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            }}>›</span>
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                spellCheck={false}
                                ref={(el) => {
                                    if (el && el.textContent !== note) {
                                        el.textContent = note;
                                    }
                                }}
                                onBlur={(e) => {
                                    const text = e.currentTarget.textContent || '';
                                    updateList(gymName, 'settersChoice', idx, text);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const text = e.currentTarget.textContent || '';
                                        updateList(gymName, 'settersChoice', idx, text);
                                        addListNote(gymName, 'settersChoice', idx);
                                        setTimeout(() => {
                                            const li = e.currentTarget.closest('li');
                                            const nextLi = li?.nextElementSibling;
                                            if (nextLi) {
                                                const editableSpan = nextLi.querySelector('[contenteditable]') as HTMLElement;
                                                if (editableSpan) editableSpan.focus();
                                            }
                                        }, 50);
                                    }
                                }}
                                style={{
                                    outline: 'none',
                                    display: 'inline-block',
                                    minWidth: 100,
                                    minHeight: 16,
                                    cursor: 'text',
                                    padding: '0 2px',
                                    borderRadius: 2,
                                }}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
});

WSPPrintContainer.displayName = 'WSPPrintContainer';
