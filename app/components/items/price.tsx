export default function Price({ value }: { value: number }) {
  return (
    <strong>
      {value === 0 ? "나눔" : `${value.toLocaleString("ko-KR")}원`}
    </strong>
  );
}
