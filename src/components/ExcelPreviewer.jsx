import React, { useState } from 'react';

const ExcelPreviewer = ({ title = '', snippet = '' }) => {
  const [activeTab, setActiveTab] = useState('Sheet1');

  const getMockSheetData = () => {
    const filename = title.toLowerCase();

    if (filename.includes('budget') || filename.includes('allocation')) {
      return {
        tabs: ['Budget Allocation', 'Department Summary', 'Audit Notes'],
        headers: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        columns: ['Category', 'Department', 'Allocated ($)', 'Spent ($)', 'Remaining ($)', 'Status', 'Quarter'],
        rows: [
          ['Cloud Infrastructure', 'Engineering', '240,000', '195,000', '45,000', 'On Track', 'Q4'],
          ['OpenSearch Node Hosting', 'Engineering', '65,000', '62,000', '3,000', 'Under Review', 'Q4'],
          ['Marketing Campaigns', 'Marketing', '45,000', '42,500', '2,500', 'On Track', 'Q4'],
          ['UI Design Tooling', 'Marketing', '15,000', '15,000', '0', 'Completed', 'Q3'],
          ['HR Recruiting Systems', 'HR', '12,000', '9,200', '2,800', 'On Track', 'Q4'],
          ['Office Supplies', 'Operations', '8,000', '7,400', '600', 'On Track', 'Q4'],
          ['Legal Counsel Retainer', 'Finance', '35,000', '30,000', '5,000', 'On Track', 'Q4'],
          ['Total Allocation', 'All Sectors', '420,000', '361,100', '58,900', 'Within Limit', '-']
        ]
      };
    }

    if (filename.includes('balance') || filename.includes('finance') || filename.includes('sheet')) {
      return {
        tabs: ['Balance Sheet', 'Q1 Projections', 'Charts'],
        headers: ['A', 'B', 'C', 'D', 'E', 'F'],
        columns: ['Asset Category', 'Target ($)', 'Actual ($)', 'Variance ($)', '% Variance', 'Verified By'],
        rows: [
          ['Cash & Cash Equivalents', '120,000', '125,400', '+5,400', '4.5%', 'A. User'],
          ['Accounts Receivable', '45,000', '42,100', '-2,900', '-6.4%', 'J. Doe'],
          ['Prepaid Expenses', '10,000', '9,800', '-200', '-2.0%', 'A. User'],
          ['Equipment & Hardware', '85,000', '88,000', '+3,000', '3.5%', 'A. User'],
          ['Office Lease Deposit', '15,000', '15,000', '0', '0.0%', 'J. Doe'],
          ['Other Current Assets', '18,500', '19,100', '+600', '3.2%', 'J. Doe'],
          ['Total Assets', '293,500', '299,400', '+5,900', '2.0%', 'Audited']
        ]
      };
    }

    return null;
  };

  const sheet = getMockSheetData();

  if (!sheet) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[350px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <div className="rounded-full bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-100 mb-3 animate-pulse">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-slate-800">Excel Preview Placeholder</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
          Grid structure could not be parsed. The spreadsheet snippet index is shown below:
        </p>
        <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg text-left text-xs font-mono text-slate-600 max-w-sm line-clamp-4 leading-relaxed italic">
          "{snippet || 'No spreadsheet cells indexed.'}"
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm">
      {/* Excel Formula Bar Mock */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-xs shrink-0 select-none font-sans">
        <div className="font-bold text-slate-400 px-1 border-r border-slate-200 pr-2">fx</div>
        <div className="text-slate-600 font-mono truncate">{snippet || `=SUM(C2:C${sheet.rows.length + 1})`}</div>
      </div>

      {/* Grid Container with Horizontal and Vertical Scroll */}
      <div className="flex-1 overflow-auto bg-slate-100">
        <table className="w-full border-collapse border-spacing-0 bg-white text-xs text-slate-700 font-mono">
          <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] text-slate-500 font-sans shadow-sm select-none">
            <tr>
              {/* Corner Cell */}
              <th className="border-r border-b border-slate-300 w-10 min-w-[40px] h-6 bg-slate-200" />
              {sheet.headers.map((hdr, idx) => (
                <th
                  key={hdr}
                  className="border-r border-b border-slate-300 font-semibold px-4 text-center h-6 min-w-[120px] bg-slate-200"
                >
                  {hdr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Headers row (Row 1 is columns header) */}
            <tr className="bg-slate-50/80 text-slate-600 font-sans font-bold select-none text-[11px]">
              <td className="border-r border-b border-slate-200 text-center font-bold bg-slate-100 h-6">1</td>
              {sheet.columns.map((col, idx) => (
                <td key={idx} className="border-r border-b border-slate-200 px-3 py-1 font-semibold truncate bg-slate-50/50">
                  {col}
                </td>
              ))}
              {/* Fill remaining headers if any */}
              {Array.from({ length: Math.max(0, sheet.headers.length - sheet.columns.length) }).map((_, idx) => (
                <td key={`empty-${idx}`} className="border-r border-b border-slate-200 bg-slate-50/50" />
              ))}
            </tr>

            {/* Content Rows */}
            {sheet.rows.map((row, rIdx) => {
              const isLastRow = rIdx === sheet.rows.length - 1;
              return (
                <tr
                  key={rIdx}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isLastRow ? 'font-bold bg-slate-50/60 border-t-2 border-slate-300' : ''
                  }`}
                >
                  {/* Row index column */}
                  <td className="border-r border-b border-slate-200 text-center font-bold bg-slate-100/80 h-6 select-none font-sans text-slate-500">
                    {rIdx + 2}
                  </td>
                  {row.map((cell, cIdx) => {
                    const isStatus = sheet.columns[cIdx] === 'Status';
                    let statusColor = 'text-slate-800';
                    if (isStatus) {
                      if (cell.includes('On Track')) statusColor = 'text-blue-600 font-semibold';
                      else if (cell.includes('Risk') || cell.includes('Review')) statusColor = 'text-amber-600 font-semibold';
                      else if (cell.includes('Completed') || cell.includes('Within')) statusColor = 'text-emerald-600 font-semibold';
                    }

                    return (
                      <td
                        key={cIdx}
                        className={`border-r border-b border-slate-150 px-3 py-1 truncate ${
                          cIdx >= 2 && cIdx <= 4 ? 'text-right' : 'text-left'
                        } ${statusColor}`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                  {/* Fill empty cells */}
                  {Array.from({ length: Math.max(0, sheet.headers.length - row.length) }).map((_, idx) => (
                    <td key={`empty-cell-${idx}`} className="border-r border-b border-slate-150" />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tabs / Footer bar */}
      <div className="flex items-center bg-slate-50 border-t border-slate-200 px-2 py-1 select-none shrink-0 font-sans">
        <div className="flex items-center gap-1">
          {sheet.tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded transition ${
                activeTab === tab
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExcelPreviewer;
