import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2, MapPin } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  // 400ms 디바운스(Debounce) 검색
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setIsSearching(false)
      setIsOpen(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const data = await searchCities(trimmed)
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error('도시 검색 오류:', err)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (city) => {
    const regionInfo = city.admin1 ? `${city.admin1}, ` : ''
    const countryInfo = city.country ? `${regionInfo}${city.country}` : ''
    const displayName = countryInfo ? `${city.name} (${countryInfo})` : city.name

    onSelectCity({
      name: displayName,
      lat: city.latitude,
      lon: city.longitude
    })

    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="city-search-container" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="도시 이름 검색 (예: 서울, Tokyo, Paris, New York...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false)
          }}
        />
        {isSearching && <Loader2 size={18} className="search-spinner spin" />}
        {!isSearching && query.length > 0 && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            <ul className="search-results-list">
              {results.map((city) => (
                <li key={city.id}>
                  <button
                    type="button"
                    className="search-result-item"
                    onClick={() => handleSelect(city)}
                  >
                    <MapPin size={16} className="item-pin-icon" />
                    <div className="item-text-wrap">
                      <span className="item-city-name">{city.name}</span>
                      <span className="item-city-detail">
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            query.trim().length >= 2 &&
            !isSearching && (
              <div className="search-empty">
                <span>일치하는 도시를 찾을 수 없습니다.</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

