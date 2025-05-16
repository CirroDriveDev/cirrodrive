// 클라이언트 키는 하드코딩해도 보안상 문제없습니다.
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

const CLIENT_KEY = "test_ck_d46qopOB892JAe2jwoQY3ZmM75y0";
export const tossPayments = await loadTossPayments(CLIENT_KEY);
