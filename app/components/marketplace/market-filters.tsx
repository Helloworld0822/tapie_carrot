import type { MarketFilters } from "@/lib/types";
export default function Filters({
  value,
  regions,
  onChange,
  onReset,
}: {
  value: MarketFilters;
  regions: readonly string[];
  onChange: (value: MarketFilters) => void;
  onReset: () => void;
}) {
  return (
    <div className="market-filters">
      <label>
        지역
        <select
          aria-label="거래 지역"
          value={value.region}
          onChange={(e) => onChange({ ...value, region: e.target.value })}
        >
          <option value="">전체 지역</option>
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label>
        가격
        <select
          aria-label="가격 필터"
          value={value.price}
          onChange={(e) => onChange({ ...value, price: e.target.value })}
        >
          <option value="all">전체 가격</option>
          <option value="free">나눔</option>
          <option value="under">1만원 이하</option>
        </select>
      </label>
      <label>
        정렬
        <select
          aria-label="상품 정렬"
          value={value.sort}
          onChange={(e) => onChange({ ...value, sort: e.target.value })}
        >
          <option value="latest">최신순</option>
          <option value="low">낮은 가격순</option>
          <option value="high">높은 가격순</option>
        </select>
      </label>
      <button className="filter-reset" onClick={onReset}>
        초기화
      </button>
    </div>
  );
}
