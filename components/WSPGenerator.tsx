import React, { useState, useRef, useCallback } from 'react';
import { Settings, Download, Mail, Image as ImageIcon, Check, X, Building2, Plus, Trash2 } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { parseWSPCSV } from '../utils/wspParser';
import { WSPGymData } from '../types';
import * as htmlToImage from 'html-to-image';
import { GYMS } from '../constants/gyms';

// Known gyms that appear in the settings email section
const SETTINGS_GYMS = ['Design District', 'Grapevine', 'Plano', 'The Hill', 'Fort Worth', 'Denton'];

const WSPGenerator: React.FC = () => {
  const { 
    wspSettings, 
    setWspSettings, 
    userWallMappings,
    addUserWallMapping
  } = useDashboardStore();

  const [wspData, setWspData] = useState<Record<string, WSPGymData & { dateRange: string }>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWallMapper, setShowWallMapper] = useState(false);
  const [pendingUnrecognized, setPendingUnrecognized] = useState<Record<string, string[]>>({});
  
  // Settings modal local state
  const [settingsNameFormat, setSettingsNameFormat] = useState<'first' | 'full'>(wspSettings.nameFormat);
  const [settingsMarketingEmail, setSettingsMarketingEmail] = useState(wspSettings.marketingEmail);
  const [settingsGymEmails, setSettingsGymEmails] = useState<Record<string, { gd: string; agd: string }>>(wspSettings.gymEmails);
  const [settingsIncludeDefaults, setSettingsIncludeDefaults] = useState(wspSettings.includeDefaultText);

  // Wall mapper local state
  const [wallMapperEntries, setWallMapperEntries] = useState<Record<string, Record<string, 'rope' | 'boulder' | 'ignored'>>>({});
  const [newZoneGym, setNewZoneGym] = useState('');
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState<'rope' | 'boulder' | 'ignored'>('boulder');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rawCsvRef = useRef<string | null>(null);

  const runParse = useCallback((csvText: string) => {
    const { plans, unrecognized } = parseWSPCSV(csvText, wspSettings.nameFormat, userWallMappings, wspSettings.includeDefaultText);
    
    if (Object.keys(unrecognized).length > 0) {
      setPendingUnrecognized(unrecognized);
      // Pre-populate wall mapper entries from unrecognized
      const entries: Record<string, Record<string, 'rope' | 'boulder' | 'ignored'>> = {};
      Object.entries(unrecognized).forEach(([gymCode, walls]) => {
        entries[gymCode] = {};
        walls.forEach(w => { entries[gymCode][w] = 'boulder'; });
      });
      setWallMapperEntries(entries);
      setShowWallMapper(true);
    } else {
      setWspData(plans as Record<string, WSPGymData & { dateRange: string }>);
    }
  }, [wspSettings.nameFormat, userWallMappings]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      rawCsvRef.current = csvData;
      runParse(csvData);
      setIsProcessing(false);
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyWallMappings = () => {
    // Save all entries to Zustand
    Object.entries(wallMapperEntries).forEach(([gymCode, walls]) => {
      Object.entries(walls).forEach(([wallName, type]) => {
        addUserWallMapping(gymCode, wallName, type);
      });
    });

    setShowWallMapper(false);
    setPendingUnrecognized({});
    setWallMapperEntries({});

    // Re-parse with updated mappings if we have cached CSV
    if (rawCsvRef.current) {
      // Need a small timeout so Zustand state propagates
      setTimeout(() => {
        const currentMappings = useDashboardStore.getState().userWallMappings;
        const { plans, unrecognized } = parseWSPCSV(rawCsvRef.current!, wspSettings.nameFormat, currentMappings, wspSettings.includeDefaultText);
        if (Object.keys(unrecognized).length > 0) {
          setPendingUnrecognized(unrecognized);
          const entries: Record<string, Record<string, 'rope' | 'boulder' | 'ignored'>> = {};
          Object.entries(unrecognized).forEach(([gymCode, walls]) => {
            entries[gymCode] = {};
            walls.forEach(w => { entries[gymCode][w] = 'boulder'; });
          });
          setWallMapperEntries(entries);
          setShowWallMapper(true);
        } else {
          setWspData(plans as Record<string, WSPGymData & { dateRange: string }>);
        }
      }, 50);
    }
  };

  // Open global wall mapper (not triggered by unrecognized walls)
  const openGlobalWallMapper = () => {
    // Load existing mappings into local state
    const entries: Record<string, Record<string, 'rope' | 'boulder' | 'ignored'>> = {};
    Object.entries(userWallMappings).forEach(([gymCode, walls]) => {
      entries[gymCode] = {};
      Object.entries(walls).forEach(([wallName, data]) => {
        entries[gymCode][wallName] = data.type;
      });
    });
    setWallMapperEntries(entries);
    setPendingUnrecognized({});
    setShowWallMapper(true);
  };

  const exportImage = async (gymName: string, dateRange: string) => {
    const el = containerRefs.current[gymName];
    if (!el) return;

    try {
      const dataUrl = await htmlToImage.toPng(el, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: { margin: '0' },
      });
      const link = document.createElement('a');
      const safeGym = gymName.replace(/\s+/g, '_');
      const safeDate = dateRange.replace(/\s+/g, '').replace(/[^\w\.\-]/g, '_');
      link.download = `Weekly_Setting_Plan_${safeGym}_${safeDate}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Failed to export image.');
    }
  };

  const emailPlan = (gymName: string, data: WSPGymData & { dateRange: string }) => {
    const gymEmails = wspSettings.gymEmails[gymName] || { gd: '', agd: '' };
    
    const ccList = [gymEmails.gd, gymEmails.agd].filter(e => e).join(';');
    const toStr = wspSettings.marketingEmail || '';
    const subject = encodeURIComponent(`Weekly Setting Plan - ${gymName} (${data.dateRange})`);
    
    const bodyStr = `Hello Team,\n\nPlease see the attached weekly setting plan (Note: please attach the downloaded image before sending) and let me know if you have any questions or concerns with our plans for next week.\n\nMy best,\n[Head Setter Name]`;
    const body = encodeURIComponent(bodyStr);
    
    window.location.href = `mailto:${toStr}?cc=${ccList}&subject=${subject}&body=${body}`;
  };

  const updateCell = (gymName: string, rowId: string, field: string, value: string) => {
    setWspData(prev => {
      const draft = { ...prev };
      const gymData = draft[gymName];
      if (gymData) {
        gymData.rows = gymData.rows.map(r => r.id === rowId ? { ...r, [field]: value } : r);
      }
      return draft;
    });
  };

  const updateList = (gymName: string, listType: 'generalNotes' | 'settersChoice', index: number, value: string) => {
      setWspData(prev => {
        const draft = { ...prev };
        const gymData = draft[gymName];
        if (gymData) {
          const newList = [...gymData[listType]];
          if (value === '' && newList.length > 1) {
            // Delete the line if emptied (keep at least one)
            newList.splice(index, 1);
          } else {
            newList[index] = value;
          }
          gymData[listType] = newList;
        }
        return draft;
      });
  };

  const addListNote = (gymName: string, listType: 'generalNotes' | 'settersChoice', afterIndex: number) => {
      setWspData(prev => {
        const draft = { ...prev };
        const gymData = draft[gymName];
        if (gymData) {
          const newList = [...gymData[listType]];
          newList.splice(afterIndex + 1, 0, '');
          gymData[listType] = newList;
        }
        return draft;
      });
  };

  // --- Settings Modal Handlers ---
  const openSettings = () => {
    setSettingsNameFormat(wspSettings.nameFormat);
    setSettingsMarketingEmail(wspSettings.marketingEmail);
    setSettingsGymEmails({ ...wspSettings.gymEmails });
    setSettingsIncludeDefaults(wspSettings.includeDefaultText);
    setShowSettings(true);
  };

  const saveSettings = () => {
    setWspSettings({
      nameFormat: settingsNameFormat,
      marketingEmail: settingsMarketingEmail,
      gymEmails: settingsGymEmails,
      includeDefaultText: settingsIncludeDefaults
    });
    setShowSettings(false);

    // Re-parse if we have cached CSV
    if (rawCsvRef.current) {
      setTimeout(() => {
        runParse(rawCsvRef.current!);
      }, 50);
    }
  };

  const updateGymEmail = (gymName: string, field: 'gd' | 'agd', value: string) => {
    setSettingsGymEmails(prev => ({
      ...prev,
      [gymName]: { ...(prev[gymName] || { gd: '', agd: '' }), [field]: value }
    }));
  };

  // --- Wall Mapper Handlers ---
  const updateWallMapperEntry = (gymCode: string, wallName: string, type: 'rope' | 'boulder' | 'ignored') => {
    setWallMapperEntries(prev => ({
      ...prev,
      [gymCode]: { ...(prev[gymCode] || {}), [wallName]: type }
    }));
  };

  const deleteWallMapperEntry = (gymCode: string, wallName: string) => {
    setWallMapperEntries(prev => {
      const newEntries = { ...prev };
      if (newEntries[gymCode]) {
        const { [wallName]: _, ...rest } = newEntries[gymCode];
        newEntries[gymCode] = rest;
        if (Object.keys(newEntries[gymCode]).length === 0) {
          delete newEntries[gymCode];
        }
      }
      return newEntries;
    });
  };

  const addNewZone = () => {
    if (!newZoneGym || !newZoneName.trim()) return;
    const gymObj = GYMS.find(g => g.name === newZoneGym);
    const gymCode = gymObj?.code || newZoneGym;
    
    setWallMapperEntries(prev => ({
      ...prev,
      [gymCode]: { ...(prev[gymCode] || {}), [newZoneName.trim().toLowerCase()]: newZoneType }
    }));
    setNewZoneName('');
  };

  const hasPendingUnrecognized = Object.keys(pendingUnrecognized).length > 0;

  const getGymNameFromCode = (code: string) => {
    const gym = GYMS.find(g => g.code === code);
    return gym ? gym.name : code;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#00205B] tracking-tight">Weekly Setting Plan Generator</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Upload your Humanity Schedule Export to generate structured weekly setting plans perfectly synced to your gym's walls.
          </p>
        </div>

        <div className="flex space-x-4">
            <button 
                onClick={openGlobalWallMapper}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
            >
                <Building2 size={18} />
                <span>Global Zone Mapper</span>
            </button>
            <button 
                onClick={openSettings}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
            >
                <Settings size={18} />
                <span>Settings</span>
            </button>
        </div>
      </div>

      {/* Upload Box */}
      {Object.keys(wspData).length === 0 && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center bg-white shadow-sm hover:border-[#008C95] hover:bg-slate-50 transition-all cursor-pointer relative group"
               onClick={() => fileInputRef.current?.click()}
          >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv"
                onChange={handleFileUpload} 
            />
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#008C95] group-hover:scale-110 transition-transform mb-6">
                <Download size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload Humanity Export</h3>
            <p className="text-slate-500 text-center max-w-md">
                Drop your Shift Planning CSV here or click to browse. The generator will automatically parse and group the shifts by gym.
            </p>
            {isProcessing && (
              <div className="mt-4 text-[#008C95] font-medium animate-pulse">Processing CSV...</div>
            )}
          </div>
      )}

      {/* Generated Plans */}
      <div className="space-y-16">
        {Object.entries(wspData).map(([gymName, data]: [string, any]) => (
          <div key={gymName} className="mb-16">
            {/* Action buttons (outside the print container) */}
            <div className="flex justify-end space-x-3 mb-4 max-w-[900px] mx-auto">
                <button onClick={() => emailPlan(gymName, data)} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">
                    <Mail size={16} /> <span>Email Plan</span>
                </button>
                <button onClick={() => exportImage(gymName, data.dateRange)} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-[#008C95] text-white rounded-lg hover:bg-[#007A82] transition-colors font-medium">
                    <ImageIcon size={16} /> <span>Download Image</span>
                </button>
            </div>

            {/* ===== PRINT CONTAINER — matches wsp_generator.html exactly ===== */}
            <div
              ref={(el) => containerRefs.current[gymName] = el}
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

              {/* Header Row: "Weekly Setting Plan | Gym Name | Date Range" */}
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
                The schedule and details below are intended to be shared with the Routesetting, Front Desk and Marketing<br/>
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
                    <th style={{ width: '15%', border: '1px solid #d3d3d3', padding: '15px 10px', textAlign: 'center', color: '#666666', fontWeight: 800, textTransform: 'capitalize', fontSize: '10.5pt', backgroundColor: 'white' }}>Boulders /<br/>ropes</th>
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
                            // Save current text first
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
          </div>
        ))}

        {Object.keys(wspData).length > 0 && (
           <div className="flex justify-center mt-12">
               <button onClick={() => { setWspData({}); rawCsvRef.current = null; }} className="text-slate-400 hover:text-slate-600 font-medium">
                   Clear &amp; Start Over
               </button>
           </div>
        )}
      </div>

      {/* ======================== SETTINGS MODAL ======================== */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-start justify-center pt-12 overflow-y-auto" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-w-[90vw] p-8 mb-12 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#00205B]">WSP Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Name Format */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Setter Name Format</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input 
                    type="radio" 
                    name="nameFormat" 
                    checked={settingsNameFormat === 'first'} 
                    onChange={() => setSettingsNameFormat('first')}
                    className="accent-[#008C95]"
                  />
                  First Name Only (e.g., Chris)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input 
                    type="radio" 
                    name="nameFormat" 
                    checked={settingsNameFormat === 'full'} 
                    onChange={() => setSettingsNameFormat('full')}
                    className="accent-[#008C95]"
                  />
                  Full Name (e.g., Chris Smith)
                </label>
              </div>
            </div>

            {/* Include Default Text */}
            <div className="mb-6 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  checked={settingsIncludeDefaults}
                  onChange={(e) => setSettingsIncludeDefaults(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-[#008C95] rounded-full peer peer-checked:bg-[#008C95] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
              <span className="text-sm text-slate-700 font-medium">Include instructional placeholder text in generated plans</span>
            </div>

            {/* Marketing Email */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Global Marketing Email</label>
              <input 
                type="email"
                value={settingsMarketingEmail}
                onChange={(e) => setSettingsMarketingEmail(e.target.value)}
                placeholder="marketing@movementgyms.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:border-transparent"
              />
            </div>

            {/* Gym-Specific Emails */}
            <h3 className="text-sm font-bold text-[#00205B] mb-3 mt-6">Gym-Specific Emails</h3>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {SETTINGS_GYMS.map(gymName => {
                const emails = settingsGymEmails[gymName] || { gd: '', agd: '' };
                return (
                  <div key={gymName} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <div className="text-sm font-bold text-slate-800 mb-2">{gymName}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Gym Director</label>
                        <input 
                          type="email"
                          value={emails.gd}
                          onChange={(e) => updateGymEmail(gymName, 'gd', e.target.value)}
                          placeholder="gd@movementgyms.com"
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Asst. Gym Director</label>
                        <input 
                          type="email"
                          value={emails.agd}
                          onChange={(e) => updateGymEmail(gymName, 'agd', e.target.value)}
                          placeholder="agd@movementgyms.com"
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={saveSettings} className="px-4 py-2 text-sm font-medium text-white bg-[#008C95] rounded-lg hover:bg-[#007A82] transition-colors flex items-center gap-2">
                <Check size={16} /> Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================== WALL MAPPER MODAL ======================== */}
      {showWallMapper && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-start justify-center pt-12 overflow-y-auto" onClick={() => { setShowWallMapper(false); setPendingUnrecognized({}); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-[650px] max-w-[90vw] p-8 mb-12 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-[#00205B]">
                {hasPendingUnrecognized ? 'New Zones Detected' : 'Global Zone Mapper'}
              </h2>
              <button onClick={() => { setShowWallMapper(false); setPendingUnrecognized({}); }} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              {hasPendingUnrecognized 
                ? 'Please define whether the following detected zones are for Ropes, Boulders, or should be Ignored.'
                : 'View and manage wall/zone mappings for all gyms. These mappings help the parser correctly categorize shift titles.'
              }
            </p>

            {/* Zone entries */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 mb-6">
              {Object.entries(wallMapperEntries).map(([gymCode, walls]) => (
                <div key={gymCode} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="text-sm font-bold text-[#00205B] mb-3 flex items-center gap-2">
                    <Building2 size={14} />
                    {getGymNameFromCode(gymCode)} ({gymCode})
                  </div>
                  <div className="space-y-2">
                    {Object.entries(walls).map(([wallName, type]) => (
                      <div key={wallName} className="flex items-center gap-3 bg-white rounded-md px-3 py-2 border border-slate-200">
                        <span className="text-sm font-medium text-slate-700 flex-1 uppercase">{wallName}</span>
                        <select 
                          value={type}
                          onChange={(e) => updateWallMapperEntry(gymCode, wallName, e.target.value as 'rope' | 'boulder' | 'ignored')}
                          className="text-xs px-2 py-1 border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#008C95]"
                        >
                          <option value="boulder">Boulder</option>
                          <option value="rope">Rope</option>
                          <option value="ignored">Ignored</option>
                        </select>
                        {!hasPendingUnrecognized && (
                          <button 
                            onClick={() => deleteWallMapperEntry(gymCode, wallName)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(wallMapperEntries).length === 0 && !hasPendingUnrecognized && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No custom zone mappings yet. Add one below.
                </div>
              )}
            </div>

            {/* Add new zone (only in global mode) */}
            {!hasPendingUnrecognized && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-6">
                <div className="text-xs font-semibold text-slate-600 mb-2">Add New Zone</div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Gym</label>
                    <select 
                      value={newZoneGym}
                      onChange={(e) => setNewZoneGym(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#008C95]"
                    >
                      <option value="">Select gym...</option>
                      {GYMS.map(g => (
                        <option key={g.code} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Zone Name</label>
                    <input 
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      placeholder="e.g. spray wall"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#008C95]"
                      onKeyDown={(e) => { if (e.key === 'Enter') addNewZone(); }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Type</label>
                    <select 
                      value={newZoneType}
                      onChange={(e) => setNewZoneType(e.target.value as 'rope' | 'boulder' | 'ignored')}
                      className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#008C95]"
                    >
                      <option value="boulder">Boulder</option>
                      <option value="rope">Rope</option>
                      <option value="ignored">Ignored</option>
                    </select>
                  </div>
                  <button 
                    onClick={addNewZone}
                    disabled={!newZoneGym || !newZoneName.trim()}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#008C95] rounded hover:bg-[#007A82] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => { setShowWallMapper(false); setPendingUnrecognized({}); }} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleApplyWallMappings} className="px-4 py-2 text-sm font-medium text-white bg-[#008C95] rounded-lg hover:bg-[#007A82] transition-colors flex items-center gap-2">
                <Check size={16} /> Save Mappings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WSPGenerator;
