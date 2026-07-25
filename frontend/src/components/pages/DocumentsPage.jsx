import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Download, 
  Eye, 
  Plus, 
  FileCheck, 
  Layers, 
  Folder,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { documentsMock } from '../../data/mockData';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(documentsMock);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const categories = ['ALL', 'Manuals', 'SOPs', 'Maintenance Logs'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.equipmentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSimulateUpload = (e) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      const newDoc = {
        id: `DOC-${Date.now().toString().slice(-3)}`,
        title: "New Technical Specification Manual 2026.pdf",
        category: "Manuals",
        equipmentId: "MTR-8842-X",
        fileSize: "6.4 MB",
        uploadedDate: new Date().toISOString().split('T')[0],
        uploadedBy: "Dipl.-Ing. M. Vance",
        indexedStatus: "INDEXED",
        pages: 32,
        fileType: "PDF",
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Industrial Document & Knowledge Hub
            </h1>
            <p className="text-slate-500 text-xs">
              Upload equipment manuals, SOPs, and maintenance logs for AI RAG indexing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Total Indexed Documents: <strong>{documents.length}</strong>
          </span>
        </div>
      </div>

      {/* Upload Dropzone Box */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-6 shadow-sm hover:border-blue-500 transition-colors text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Drag & Drop Equipment Manuals, SOPs, or Logs
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, DOCX, CAD drawings, and scanned maintenance reports (Up to 100MB)
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleSimulateUpload}
              disabled={isUploading}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              {isUploading ? (
                <span>Indexing Document into Vector DB...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Upload & Auto-Index Document</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Machine Manuals', count: '142 Files', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Standard Operating Procedures (SOPs)', count: '86 Files', icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Maintenance & Service Logs', count: '310 Files', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'CAD & Schematics', count: '24 Files', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{stat.count}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or Equipment ID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-slate-800"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-y border-slate-200 font-semibold text-slate-600">
              <tr>
                <th className="p-3">Document Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Target Asset</th>
                <th className="p-3">Size</th>
                <th className="p-3">Uploaded</th>
                <th className="p-3">AI RAG Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-blue-50 text-blue-600 border border-blue-200 font-mono text-[10px] font-bold">
                        {doc.fileType}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{doc.title}</div>
                        <div className="text-[10px] text-slate-400">{doc.pages} pages • By {doc.uploadedBy}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px] border border-slate-200">
                      {doc.category}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">
                    {doc.equipmentId}
                  </td>
                  <td className="p-3 font-mono text-slate-500">{doc.fileSize}</td>
                  <td className="p-3 text-slate-500 font-mono">{doc.uploadedDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      doc.indexedStatus === 'INDEXED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {doc.indexedStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" 
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Download Document">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Document Inspection Modal</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-base">{selectedDoc.title}</div>
              <div className="text-slate-500">Target Equipment: <strong className="text-slate-800 font-mono">{selectedDoc.equipmentId}</strong></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-mono text-[11px] leading-relaxed">
                Indexed in TwinMind AI Vector Store. RAG embedding active for precision engineering queries.
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedDoc(null)} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
