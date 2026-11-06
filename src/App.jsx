import React, { useState, useMemo } from 'react';

// アイコン用の簡易SVGコンポーネント（外部ライブラリ不要で確実に動きます）
const Icons = {
  Building: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Alert: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Phone: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Map: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Sparkles: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Paperclip: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
};

const STATUSES = [
  { id: 'assigned', label: '新規割当', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'survey_scheduling', label: '下見日程調整中', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { id: 'survey_scheduled', label: '下見予定確定', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  { id: 'survey_completed', label: '下見完了/作成中', color: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
  { id: 'quote_submitted', label: '見積提出済', color: 'bg-purple-50 text-purple-700 border-purple-300' },
];

const CONTRACTORS = [
  { id: 'c1', name: '株式会社サクラ設備', phone: '090-1234-5678' },
  { id: 'c2', name: '大和内装リノベーション', phone: '080-8765-4321' },
];

const CURRENT_DATE = new Date('2026-11-06T00:00:00');

function checkProjectAlert(project) {
  if (!project.surveyDate && (project.status === 'assigned' || project.status === 'survey_scheduling')) {
    if (project.assignedDate) {
      const assigned = new Date(project.assignedDate);
      const diffDays = Math.floor((CURRENT_DATE - assigned) / (1000 * 60 * 60 * 24));
      if (diffDays >= 3) {
        return { type: 'danger', label: `割当後${diffDays}日経過・下見未定`, badgeColor: 'bg-red-600 text-white' };
      }
    }
  }
  if (project.surveyDate && project.status === 'survey_scheduled') {
    const survey = new Date(project.surveyDate);
    const diffDays = Math.floor((CURRENT_DATE - survey) / (1000 * 60 * 60 * 24));
    if (diffDays >= 7) {
      return { type: 'warning', label: `下見日から${diffDays}日経過・報告未`, badgeColor: 'bg-amber-500 text-white' };
    }
  }
  return null;
}

const SAMPLE_OCR = {
  cainz: {
    storeName: 'カインズ 岡崎美合店',
    title: '【玄関ドア相談会】森下秀昭様 ラッピング張替工事',
    clientName: '森下 秀昭',
    clientPhone: '090-5870-1232',
    address: '愛知県岡崎市戸崎町藤狭13-141',
    surveyNotes: '【現調希望日】土日 / 玄関ドア引戸張替',
    contractorId: 'c2',
    fileName: '見積情報_森下様.pdf'
  },
  dcm: {
    storeName: 'DCM21浜松店',
    title: '藤井 健二様邸 シャッター取付工事',
    clientName: '藤井 健二',
    clientPhone: '080-7854-7359',
    address: '静岡県浜松市中央区中田町31-2',
    surveyNotes: '【現調希望】平日可 / 窓シャッター5ヶ所',
    contractorId: 'c1',
    fileName: '見積依頼_藤井様.pdf'
  }
};

const INITIAL_PROJECTS = [
  {
    id: 'PRJ-001',
    title: '藤井 健二様邸 シャッター取付工事',
    clientName: '藤井 健二',
    clientPhone: '080-7854-7359',
    address: '静岡県浜松市中央区中田町31-2',
    storeName: 'DCM21浜松店',
    contractorId: 'c1',
    status: 'assigned',
    surveyDate: '',
    surveyTime: '',
    assignedDate: '2026-11-01',
    requestDocument: { name: '見積依頼_DCM浜松_藤井様.pdf' },
    surveyReports: [],
    submittedQuotes: [],
    messages: []
  },
  {
    id: 'PRJ-002',
    title: '【玄関ドア相談会】森下秀昭様 ラッピング張替',
    clientName: '森下 秀昭',
    clientPhone: '090-5870-1232',
    address: '愛知県岡崎市戸崎町藤狭13-141',
    storeName: 'カインズ 岡崎美合店',
    contractorId: 'c2',
    status: 'survey_scheduled',
    surveyDate: '2026-10-25',
    surveyTime: '13:30',
    assignedDate: '2026-10-20',
    requestDocument: { name: 'カインズ_森下様.pdf' },
    surveyReports: [],
    submittedQuotes: [],
    messages: []
  }
];

export default function App() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [currentRole, setCurrentRole] = useState('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const getContractor = (id) => CONTRACTORS.find((c) => c.id === id) || CONTRACTORS[0];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (currentRole !== 'admin' && p.contractorId !== currentRole) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q) || p.storeName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [projects, currentRole, searchQuery]);

  const handleSave = (updated) => {
    let status = updated.status;
    if (updated.submittedQuotes?.length > 0) status = 'quote_submitted';
    else if (updated.surveyReports?.length > 0) status = 'survey_completed';
    else if (updated.surveyDate && (status === 'assigned' || status === 'survey_scheduling')) status = 'survey_scheduled';

    setProjects(prev => prev.map(p => p.id === updated.id ? { ...updated, status } : p));
    setEditingProject(null);
  };

  const handleAddOcrProject = (sample) => {
    const newP = {
      id: `PRJ-00${projects.length + 1}`,
      title: sample.title,
      clientName: sample.clientName,
      clientPhone: sample.clientPhone,
      address: sample.address,
      storeName: sample.storeName,
      contractorId: sample.contractorId,
      status: 'assigned',
      surveyDate: '',
      surveyTime: '',
      assignedDate: '2026-11-06',
      requestDocument: { name: sample.fileName },
      surveyReports: [],
      submittedQuotes: [],
      messages: []
    };
    setProjects([newP, ...projects]);
    setIsOcrOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif' }}>
      {/* ヘッダー */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#2563eb', color: '#ffffff', padding: '6px', borderRadius: '8px' }}><Icons.Building /></div>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>見積・下見進捗管理ポータル</h1>
            <span style={{ fontSize: '11px', color: '#64748b' }}>現場スマホ同期対応</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
          >
            <option value="admin">🏢 自社 (管理者)</option>
            <option value="c1">🔧 協力会社A (サクラ設備)</option>
            <option value="c2">🔨 協力会社B (大和内装)</option>
          </select>

          {currentRole === 'admin' && (
            <button
              onClick={() => setIsOcrOpen(true)}
              style={{ background: '#4f46e5', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <Icons.Sparkles /> 依頼書読取
            </button>
          )}
        </div>
      </header>

      {/* メイン画面 */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {/* 検索バー */}
        <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Search />
          <input
            type="text"
            placeholder="店舗名（カインズ・DCM）、お客様名、工事名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>

        {/* カンバンボード */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'start' }}>
          {STATUSES.map((status) => {
            const items = filteredProjects.filter((p) => p.status === status.id);
            return (
              <div key={status.id} style={{ background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>{status.label}</span>
                  <span style={{ background: '#ffffff', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold' }}>{items.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {items.map((project) => {
                    const alert = checkProjectAlert(project);
                    return (
                      <div
                        key={project.id}
                        onClick={() => setEditingProject(project)}
                        style={{
                          background: alert?.type === 'danger' ? '#fef2f2' : alert?.type === 'warning' ? '#fffbeb' : '#ffffff',
                          border: alert?.type === 'danger' ? '1px solid #f87171' : alert?.type === 'warning' ? '1px solid #fbbf24' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        {alert && (
                          <div style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }} className={alert.badgeColor}>
                            <Icons.Alert /> {alert.label}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span style={{ color: '#1d4ed8', background: '#dbeafe', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{project.storeName}</span>
                          <span style={{ color: '#94a3b8' }}>{project.id}</span>
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', lineHeight: '1.3' }}>{project.title}</div>
                        <div style={{ fontSize: '12px', color: '#475569' }}>{project.clientName} 様</div>

                        <div style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icons.Map />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.address}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '6px', fontSize: '11px' }}>
                          <span style={{ fontWeight: 'bold', color: '#334155' }}>{getContractor(project.contractorId).name}</span>
                          <a href={`tel:${project.clientPhone}`} onClick={(e) => e.stopPropagation()} style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 'bold' }}>
                            <Icons.Phone /> 発信
                          </a>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icons.Calendar />
                            <span style={{ fontWeight: 'bold', color: project.surveyDate ? '#1e293b' : '#dc2626' }}>
                              {project.surveyDate ? `${project.surveyDate} ${project.surveyTime || ''}` : '下見未定'}
                            </span>
                          </div>
                          {project.requestDocument && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setPreviewDoc(project.requestDocument); }}
                              style={{ border: 'none', background: 'none', color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px', fontWeight: 'bold' }}
                            >
                              <Icons.Paperclip /> 原本
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 編集モーダル */}
      {editingProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '500px', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#2563eb', color: '#ffffff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', background: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{editingProject.storeName}</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 'bold' }}>{editingProject.title}</h3>
              </div>
              <button onClick={() => setEditingProject(null)} style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer' }}><Icons.Close /></button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>進捗ステータス</label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#1e40af' }}>下見日設定</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="date"
                    value={editingProject.surveyDate || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, surveyDate: e.target.value })}
                    style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    placeholder="訪問時間 (例: 14:00〜)"
                    value={editingProject.surveyTime || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, surveyTime: e.target.value })}
                    style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>下見報告（写真・メモ添付）</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setEditingProject({
                        ...editingProject,
                        surveyReports: [...(editingProject.surveyReports || []), { name: f.name }],
                        status: 'survey_completed'
                      });
                    }
                  }}
                  style={{ fontSize: '12px' }}
                />
                {editingProject.surveyReports?.map((r, i) => (
                  <div key={i} style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>📎 添付済: {r.name}</div>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>提出見積書添付 (PDF)</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setEditingProject({
                        ...editingProject,
                        submittedQuotes: [...(editingProject.submittedQuotes || []), { name: f.name }],
                        status: 'quote_submitted'
                      });
                    }
                  }}
                  style={{ fontSize: '12px' }}
                />
                {editingProject.submittedQuotes?.map((q, i) => (
                  <div key={i} style={{ fontSize: '11px', color: '#7c3aed', marginTop: '4px' }}>📄 提出見積書: {q.name}</div>
                ))}
              </div>

              <button
                onClick={() => handleSave(editingProject)}
                style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
              >
                内容を更新して保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI読取サンプル選択モーダル */}
      {isOcrOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '420px', width: '100%', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 'bold' }}>📄 依頼書読取シミュレーション</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px' }}>取り込む書類を選択してください:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleAddOcrProject(SAMPLE_OCR.cainz)}
                style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
              >
                <strong style={{ display: 'block', fontSize: '13px', color: '#1d4ed8' }}>カインズ岡崎美合店</strong>
                <span style={{ fontSize: '11px', color: '#475569' }}>森下秀昭様 / ドアラッピング工事</span>
              </button>
              <button
                onClick={() => handleAddOcrProject(SAMPLE_OCR.dcm)}
                style={{ textAlign: 'left', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
              >
                <strong style={{ display: 'block', fontSize: '13px', color: '#1d4ed8' }}>DCM21浜松店</strong>
                <span style={{ fontSize: '11px', color: '#475569' }}>藤井健二様 / 窓シャッター5ヶ所</span>
              </button>
            </div>
            <button onClick={() => setIsOcrOpen(false)} style={{ width: '100%', marginTop: '12px', padding: '8px', borderRadius: '8px', border: 'none', background: '#e2e8f0', cursor: 'pointer', fontSize: '12px' }}>
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 添付原本プレビュー表示 */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }} onClick={() => setPreviewDoc(null)}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', textAlign: 'center', maxWidth: '350px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{previewDoc.name}</h4>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>案件に添付された原本書類データです</p>
            <button onClick={() => setPreviewDoc(null)} style={{ marginTop: '12px', padding: '6px 16px', borderRadius: '6px', border: 'none', background: '#1e293b', color: '#ffffff', fontSize: '12px', cursor: 'pointer' }}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}