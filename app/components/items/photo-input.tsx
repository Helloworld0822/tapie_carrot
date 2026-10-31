"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Icon from "../ui-icon";
export default function PhotoInput() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(""),
    [error, setError] = useState("");
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  return (
    <div className="photo-field">
      <p className="photo-field-title">
        물품 사진 <span>선택 · 최대 1장</span>
      </p>
      <div className="photo-selection">
        <label className="photo-picker">
          <Icon name="plus" />
          <strong>{file ? "사진 바꾸기" : "사진 추가"}</strong>
          <span>{file ? "1 / 1" : "0 / 1"}</span>
          <input
            ref={input}
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            aria-label="물품 사진 선택"
            onChange={(event) => {
              const photo = event.target.files?.[0] || null;
              if (
                photo &&
                (photo.size > 5 * 1024 * 1024 ||
                  !["image/jpeg", "image/png", "image/webp"].includes(
                    photo.type,
                  ))
              ) {
                setError("5MB 이하 JPEG, PNG, WebP 사진을 선택해주세요.");
                event.target.value = "";
                setFile(null);
                setPreview("");
                return;
              }
              setError("");
              setFile(photo);
              setPreview(photo ? URL.createObjectURL(photo) : "");
            }}
          />
        </label>
        {preview && (
          <div className="photo-thumbnail">
            <Image
              src={preview}
              alt="등록할 물품 사진 미리보기"
              width={132}
              height={132}
              unoptimized
            />
            <button
              type="button"
              aria-label="사진 제거"
              onClick={() => {
                setFile(null);
                setPreview("");
                if (input.current) input.current.value = "";
              }}
            >
              ×
            </button>
            <span>대표 사진</span>
          </div>
        )}
      </div>
      <p className="photo-caption">
        {file ? file.name : "밝은 곳에서 물건 전체가 보이게 찍어주세요."}
      </p>
      <p className="field-help">JPEG, PNG, WebP · 최대 5MB</p>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
