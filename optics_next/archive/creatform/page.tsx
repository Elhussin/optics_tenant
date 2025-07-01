// 'use client';
// import React, { useState } from 'react';
// import { 
//   Play, 
//   Settings, 
//   Download, 
//   Eye, 
//   Code, 
//   Palette, 
//   FileText, 
//   Zap,
//   Copy,
//   Check,
//   AlertCircle,
//   Trash2,
//   Plus,
//   Save
// } from 'lucide-react';

// // Mock data - في التطبيق الحقيقي هيجي من API
// const mockSchemas = {
//   user_schema: {
//     name: 'User Schema',
//     fields: ['name', 'email', 'password', 'phone', 'is_active'],
//     description: 'Schema for user management'
//   },
//   product_schema: {
//     name: 'Product Schema', 
//     fields: ['title', 'description', 'price', 'category', 'in_stock'],
//     description: 'Schema for product catalog'
//   },
//   order_schema: {
//     name: 'Order Schema',
//     fields: ['customer_name', 'total_amount', 'status', 'order_date'],
//     description: 'Schema for order processing'
//   }
// };

// const defaultThemes = {
//   modern: {
//     name: '🎨 Modern',
//     baseClasses: 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500',
//     submitButtonClasses: 'w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-medium',
//     containerClasses: 'space-y-5 bg-white p-6 rounded-2xl shadow-sm'
//   },
//   minimal: {
//     name: '✨ Minimal',
//     baseClasses: 'w-full px-3 py-2 border-b-2 border-gray-300 focus:border-blue-500 bg-transparent focus:outline-none',
//     submitButtonClasses: 'bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800',
//     containerClasses: 'space-y-4'
//   },
//   dashboard: {
//     name: '📊 Dashboard',
//     baseClasses: 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500',
//     submitButtonClasses: 'bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700',
//     containerClasses: 'grid grid-cols-2 gap-4'
//   }
// };

// export default function FormGeneratorPage() {
//   const [selectedSchema, setSelectedSchema] = useState('user_schema');
//   const [apiEndpoint, setApiEndpoint] = useState('users');
//   const [selectedTheme, setSelectedTheme] = useState('modern');
//   const [customConfig, setCustomConfig] = useState('');
//   const [generatedCode, setGeneratedCode] = useState('');
//   const [activeTab, setActiveTab] = useState('generator');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [copySuccess, setCopySuccess] = useState('');
//   const [savedConfigs, setSavedConfigs] = useState([]);

//   // Preview data
//   const [previewData, setPreviewData] = useState({
//     formComponent: '',
//     hookCode: '',
//     apiService: ''
//   });

//   // Generate form function
//   const generateForm = async () => {
//     setIsGenerating(true);
    
//     // محاكاة API call
//     setTimeout(() => {
//       const schema = mockSchemas[selectedSchema];
//       const theme = defaultThemes[selectedTheme];
      
//       const formCode = `// Generated ${schema.name} Form
// import React from 'react';
// import { use${schema.name.replace(' Schema', '')}Form } from '@/src/lib/forms/use${schema.name.replace(' Schema', '')}Form';

// export default function ${schema.name.replace(' Schema', '')}Form({ onSuccess, onCancel, ...options }) {
//   const { register, handleSubmit, formState: { errors, isSubmitting }, submitForm } = use${schema.name.replace(' Schema', '')}Form(options);

//   const onSubmit = async (data) => {
//     try {
//       await submitForm(data);
//       onSuccess?.(data);
//     } catch (error) {
//       console.error('Form submission error:', error);
//     }
//   };

//   return (
//     <div className="${theme.containerClasses}">
//       <form onSubmit={handleSubmit(onSubmit)}>
//         ${schema.fields.map(field => `
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">${field.replace('_', ' ')}</label>
//           <input {...register("${field}")} className="${theme.baseClasses}" />
//           {errors.${field} && <p className="text-red-500 text-sm">{errors.${field}.message}</p>}
//         </div>`).join('')}
        
//         <button type="submit" disabled={isSubmitting} className="${theme.submitButtonClasses}">
//           {isSubmitting ? 'Saving...' : 'Save'}
//         </button>
//       </form>
//     </div>
//   );
// }`;

//       setGeneratedCode(formCode);
//       setPreviewData({
//         formComponent: formCode,
//         hookCode: `// Hook for ${schema.name}`,
//         apiService: `// API service for ${apiEndpoint}`
//       });
//       setIsGenerating(false);
//     }, 1500);
//   };

//   // Copy to clipboard
//   const copyToClipboard = (text, type) => {
//     navigator.clipboard.writeText(text);
//     setCopySuccess(type);
//     setTimeout(() => setCopySuccess(''), 2000);
//   };

//   // Save config
//   const saveConfig = () => {
//     const config = {
//       id: Date.now(),
//       name: `Config-${selectedSchema}-${selectedTheme}`,
//       schema: selectedSchema,
//       endpoint: apiEndpoint,
//       theme: selectedTheme,
//       customConfig: customConfig,
//       createdAt: new Date().toLocaleString()
//     };
//     setSavedConfigs([...savedConfigs, config]);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Form Generator</h1>
//           <p className="text-gray-600">Generate React forms from Zod schemas with custom themes</p>
//         </div>

//         {/* Navigation Tabs */}
//         <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
//           {[
//             { id: 'generator', label: 'Generator', icon: Zap },
//             { id: 'themes', label: 'Themes', icon: Palette },
//             { id: 'preview', label: 'Preview', icon: Eye },
//             { id: 'code', label: 'Generated Code', icon: Code },
//             { id: 'configs', label: 'Saved Configs', icon: Settings }
//           ].map(tab => {
//             const Icon = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
//                   activeTab === tab.id 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
//                 }`}
//               >
//                 <Icon size={16} />
//                 <span>{tab.label}</span>
//               </button>
//             );
//           })}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Configuration Panel */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h2 className="text-lg font-semibold mb-4 flex items-center">
//                 <Settings size={20} className="mr-2" />
//                 Configuration
//               </h2>

//               {/* Schema Selection */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Schema</label>
//                 <select
//                   value={selectedSchema}
//                   onChange={(e) => setSelectedSchema(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   {Object.entries(mockSchemas).map(([key, schema]) => (
//                     <option key={key} value={key}>{schema.name}</option>
//                   ))}
//                 </select>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Fields: {mockSchemas[selectedSchema].fields.join(', ')}
//                 </p>
//               </div>

//               {/* API Endpoint */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
//                 <input
//                   type="text"
//                   value={apiEndpoint}
//                   onChange={(e) => setApiEndpoint(e.target.value)}
//                   placeholder="e.g., users, products"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>

//               {/* Theme Selection */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
//                 <div className="space-y-2">
//                   {Object.entries(defaultThemes).map(([key, theme]) => (
//                     <label key={key} className="flex items-center space-x-2 cursor-pointer">
//                       <input
//                         type="radio"
//                         name="theme"
//                         value={key}
//                         checked={selectedTheme === key}
//                         onChange={(e) => setSelectedTheme(e.target.value)}
//                         className="text-blue-600"
//                       />
//                       <span className="text-sm">{theme.name}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Custom Config */}
//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Custom Config (JSON)</label>
//                 <textarea
//                   value={customConfig}
//                   onChange={(e) => setCustomConfig(e.target.value)}
//                   placeholder='{"submitButtonText": "Custom Save"}'
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-mono"
//                   rows="4"
//                 />
//               </div>

//               {/* Action Buttons */}
//               <div className="space-y-2">
//                 <button
//                   onClick={generateForm}
//                   disabled={isGenerating}
//                   className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
//                 >
//                   {isGenerating ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                       <span>Generating...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Play size={16} />
//                       <span>Generate Form</span>
//                     </>
//                   )}
//                 </button>

//                 <button
//                   onClick={saveConfig}
//                   className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 flex items-center justify-center space-x-2"
//                 >
//                   <Save size={16} />
//                   <span>Save Config</span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             {activeTab === 'generator' && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h2 className="text-lg font-semibold mb-4">Form Generator</h2>
//                 <div className="text-center py-12">
//                   <Zap size={48} className="mx-auto text-gray-400 mb-4" />
//                   <p className="text-gray-600 mb-4">Configure your form settings and click "Generate Form"</p>
//                   <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
//                     <h4 className="font-medium text-blue-900 mb-2">Command Preview:</h4>
//                     <code className="text-sm text-blue-800 break-all">
//                       node scripts/generate-zod-form.ts {selectedSchema} {apiEndpoint} ./config/themes/{selectedTheme}.json
//                     </code>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'themes' && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h2 className="text-lg font-semibold mb-4">Theme Showcase</h2>
//                 <div className="grid gap-6">
//                   {Object.entries(defaultThemes).map(([key, theme]) => (
//                     <div key={key} className="border border-gray-200 rounded-lg p-4">
//                       <h3 className="font-medium mb-3">{theme.name}</h3>
//                       <div className="space-y-3">
//                         <div>
//                           <label className="block text-sm font-medium mb-1">Sample Input</label>
//                           <input placeholder="Preview input..." className={theme.baseClasses} />
//                         </div>
//                         <button className={theme.submitButtonClasses}>Sample Button</button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {activeTab === 'preview' && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
//                 {generatedCode ? (
//                   <div className="border border-gray-200 rounded-lg p-4">
//                     <h3 className="font-medium mb-3">Generated Form Preview</h3>
//                     <div className={defaultThemes[selectedTheme].containerClasses}>
//                       {mockSchemas[selectedSchema].fields.map(field => (
//                         <div key={field} className="mb-4">
//                           <label className="block text-sm font-medium mb-1">
//                             {field.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
//                           </label>
//                           <input 
//                             placeholder={`Enter ${field.replace('_', ' ')}...`}
//                             className={defaultThemes[selectedTheme].baseClasses} 
//                           />
//                         </div>
//                       ))}
//                       <button className={defaultThemes[selectedTheme].submitButtonClasses}>
//                         Save
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-12">
//                     <Eye size={48} className="mx-auto text-gray-400 mb-4" />
//                     <p className="text-gray-600">Generate a form to see the preview</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'code' && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold">Generated Code</h2>
//                   {generatedCode && (
//                     <button
//                       onClick={() => copyToClipboard(generatedCode, 'code')}
//                       className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
//                     >
//                       {copySuccess === 'code' ? <Check size={16} /> : <Copy size={16} />}
//                       <span>{copySuccess === 'code' ? 'Copied!' : 'Copy'}</span>
//                     </button>
//                   )}
//                 </div>
                
//                 {generatedCode ? (
//                   <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
//                     <pre className="text-sm"><code>{generatedCode}</code></pre>
//                   </div>
//                 ) : (
//                   <div className="text-center py-12">
//                     <Code size={48} className="mx-auto text-gray-400 mb-4" />
//                     <p className="text-gray-600">Generate a form to see the code</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'configs' && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h2 className="text-lg font-semibold mb-4">Saved Configurations</h2>
//                 {savedConfigs.length > 0 ? (
//                   <div className="space-y-3">
//                     {savedConfigs.map(config => (
//                       <div key={config.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
//                         <div>
//                           <h4 className="font-medium">{config.name}</h4>
//                           <p className="text-sm text-gray-600">
//                             {config.schema} → {config.endpoint} ({config.theme} theme)
//                           </p>
//                           <p className="text-xs text-gray-500">{config.createdAt}</p>
//                         </div>
//                         <div className="flex space-x-2">
//                           <button 
//                             onClick={() => {
//                               setSelectedSchema(config.schema);
//                               setApiEndpoint(config.endpoint);
//                               setSelectedTheme(config.theme);
//                               setCustomConfig(config.customConfig);
//                             }}
//                             className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
//                           >
//                             Load
//                           </button>
//                           <button 
//                             onClick={() => setSavedConfigs(savedConfigs.filter(c => c.id !== config.id))}
//                             className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-12">
//                     <FileText size={48} className="mx-auto text-gray-400 mb-4" />
//                     <p className="text-gray-600">No saved configurations yet</p>
//                     <p className="text-sm text-gray-500">Save a configuration to reuse it later</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';


export default function CreateForm() {
    return (
        <>
            <h1>Create Form</h1>
        </>
    );
}