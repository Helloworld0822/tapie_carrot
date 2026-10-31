import Account from '../account';
import Header from '../header';
export default function ChatsPage(){return <><header className="top"><div className="nav"><a href="/" aria-label="당근 홈"><Header/></a><a href="/#market">중고거래</a><Account initialOpen/></div></header><main className="section"><p className="eyebrow">당신 근처의 이웃</p><h1>거래 이야기를 이어가세요.</h1><p>오른쪽 아래 채팅에서 이웃과 나눈 대화를 확인할 수 있어요.</p><a className="primary" href="/#market">동네 물건 둘러보기 →</a></main></>;}
