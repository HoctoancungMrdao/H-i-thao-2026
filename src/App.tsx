import React, { useState, useEffect } from 'react';

// Link API Google Apps Script đã tích hợp trực tiếp
const API_URL = "https://script.google.com/macros/s/AKfycbwaevxVit54JZSzYYIkJWzn0-BIKJ-mNSkQbJ4NNXrk5CJt-vgdGOXAc7u4fS0ZIJ--Ug/exec";

const TABS = ["BĐ Nam", "BĐ Nữ", "BĐ Khối 8-9", "BĐ Khối 6-7"];

interface MatchData {
  [key: string]: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("BĐ Nam");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Hàm đọc dữ liệu cột linh hoạt theo tên tiêu đề trên Google Sheet
  const getValue = (obj: MatchData, keys: string[]) => {
    for (let k of keys) {
      for (let prop in obj) {
        if (prop.toLowerCase().trim() === k.toLowerCase().trim()) {
          return obj[prop];
        }
      }
    }
    return "";
  };

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_URL}?sheet=${encodeURIComponent(activeTab)}`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
        } else {
          setMatches(data);
        }
      })
      .catch(() => {
        setLoading(false);
        setError("Không thể kết nối đến dữ liệu. Vui lòng kiểm tra lại cấu hình Google Apps Script.");
      });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
      {/* Header Thể Thao */}
      <header className="bg-emerald-700 text-white py-6 px-4 shadow-md text-center sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-wide uppercase">
          Giải Bóng Đá Học Đường
        </h1>
        <p className="text-emerald-100 text-xs md:text-sm mt-1">
          Lịch thi đấu & cập nhật kết quả trực tiếp
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6">
        {/* Thanh chọn 4 nội dung giải đấu */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none justify-start md:justify-center">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Thông báo Đang tải dữ liệu */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mb-3"></div>
            <p className="text-slate-500 text-sm font-medium">Đang tải lịch thi đấu...</p>
          </div>
        )}

        {/* Thông báo nếu xảy ra lỗi */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-center text-sm">
            {error}
          </div>
        )}

        {/* Thẻ danh sách các trận đấu */}
        {!loading && !error && (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-500 text-sm shadow-sm">
                Chưa có dữ liệu trận đấu cho nội dung này.
              </div>
            ) : (
              matches.map((match, idx) => {
                const teamA = getValue(match, ["Đội A", "Team A", "Đội 1"]) || "Đội A";
                const teamB = getValue(match, ["Đội B", "Team B", "Đội 2"]) || "Đội B";
                const scoreA = getValue(match, ["Tỷ số A", "Ty so A", "Score A"]) ?? "-";
                const scoreB = getValue(match, ["Tỷ số B", "Ty so B", "Score B"]) ?? "-";
                const date = getValue(match, ["Ngày thi đấu", "Ngày", "Thời gian"]) || "";
                const status = getValue(match, ["Trạng thái", "Trang thai"]) || "";

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-emerald-500 transition-colors"
                  >
                    {/* Đội A */}
                    <div className="flex-1 text-right font-bold text-slate-800 text-sm md:text-base pr-3">
                      {teamA}
                    </div>

                    {/* Khối tỷ số trung tâm */}
                    <div className="flex flex-col items-center justify-center min-w-[100px] px-2">
                      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-black text-base md:text-lg tracking-wider flex items-center gap-1 shadow-inner">
                        <span>{scoreA}</span>
                        <span className="text-slate-400 text-xs">:</span>
                        <span>{scoreB}</span>
                      </div>
                      {date && <span className="text-[11px] text-slate-400 mt-1 font-medium">{date}</span>}
                      {status && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 uppercase">
                          {status}
                        </span>
                      )}
                    </div>

                    {/* Đội B */}
                    <div className="flex-1 text-left font-bold text-slate-800 text-sm md:text-base pl-3">
                      {teamB}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
