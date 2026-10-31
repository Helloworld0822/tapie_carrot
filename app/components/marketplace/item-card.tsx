import Link from "next/link";
import Image from "next/image";
import type { Item } from "@/lib/types";
import Price from "../items/price";
export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link className="card" href={`/items/${item.id}`}>
      <div className={"item-image image-" + (item.id % 4)}>
        {item.has_photo ? (
          <Image
            src={`/api/items/${item.id}/image`}
            alt={item.title}
            fill
            sizes="(max-width: 800px) 46vw, 260px"
          />
        ) : (
          <span>{item.price === 0 ? "이웃과 나누는 물건" : "사진 미등록"}</span>
        )}
        {item.price === 0 && <em className="share-badge">나눔</em>}
      </div>
      <h3>{item.title}</h3>
      <Price value={item.price} />
      <p>{item.location}</p>
      <small>{item.seller_name || "동네 예시 상품"}</small>
    </Link>
  );
}
