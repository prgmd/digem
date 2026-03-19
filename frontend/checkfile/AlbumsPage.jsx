import React, { useState, useEffect } from 'react';
import './AlbumsPage.css'; // 스타일링을 위한 CSS 파일 임포트

function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString();
  const [selectedRegion, setSelectedRegion] = useState('all'); // 'all', 'KOR', 'GLOBAL'
  const [selectedType, setSelectedType] = useState('all');     // 'all', 'LP', 'EP'
  const [selectedYear, setSelectedYear] = useState(currentYear);     // 'all', '2023', '2024', ...
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);   // 'all', '1', '2', ...
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/albums`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Fetched album data:", data); // 데이터 구조 확인을 위한 로그 추가
        setAlbums(data);

        // 연도 추출
        const years = [...new Set(data.map(album => new Date(album.release_date).getFullYear().toString()))].sort((a, b) => b - a);
        setAvailableYears(['all', ...years]);
        // 월 추출 (1월부터 12월까지)
        setAvailableMonths(['all', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())]);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때 한 번만 실행

  if (loading) {
    return <div className="albums-container"><p>로딩 중...</p></div>;
  }

  if (error) {
    return <div className="albums-container"><p>데이터를 불러오는 데 실패했습니다: {error}</p></div>;
  }

  const filteredAlbums = albums.filter(album => {
    const albumYear = new Date(album.release_date).getFullYear().toString();
    const albumMonth = (new Date(album.release_date).getMonth() + 1).toString();

    const regionMatch = selectedRegion === 'all' || album.region === selectedRegion;
    const typeMatch = selectedType === 'all' || album.type === selectedType;
    const yearMatch = selectedYear === 'all' || albumYear === selectedYear;
    const monthMatch = selectedMonth === 'all' || albumMonth === selectedMonth;

    return regionMatch && typeMatch && yearMatch && monthMatch;
  });

  return (
    <div className="albums-container">
      <h2 className="albums-title">New Albums</h2>
      <div className="album-filters">
        {/* 지역 필터 */}
        <select onChange={(e) => setSelectedRegion(e.target.value)} value={selectedRegion}>
          <option value="all">지역</option>
          <option value="국내">국내</option>
          <option value="해외">해외</option>
        </select>

        {/* 유형 필터 */}
        <select onChange={(e) => setSelectedType(e.target.value)} value={selectedType}>
          <option value="all">유형</option>
          <option value="정규">정규</option>
          <option value="EP">EP</option>
        </select>

        {/* 연도 필터 */}
        <select onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear}>
          {availableYears.map(year => (
            <option key={year} value={year}>{year === 'all' ? '연도' : year}</option>
          ))}
        </select>

        {/* 월 필터 */}
        <select onChange={(e) => setSelectedMonth(e.target.value)} value={selectedMonth}>
          {availableMonths.map(month => (
            <option key={month} value={month}>{month === 'all' ? '월' : `${month}월`}</option>
          ))}
        </select>
      </div>
      <div className="albums-grid">
        {filteredAlbums.map((album, index) => (
          <div 
            key={album.id} 
            className="album-card album-card-animated"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <img src={album.artwork_url} alt={album.title} className="album-artwork" />
            <div className="album-info">
              <h3 className="album-title-text" title={album.title}>{album.title}</h3>
              <p className="album-artist">{album.artist}</p>
              <div className="album-meta">
                <span>
                  {album.region}
                  {album.type ? ` · ${album.type}` : ''}
                  {album.release_date ? ` · ${formatDate(album.release_date)}` : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlbumsPage;