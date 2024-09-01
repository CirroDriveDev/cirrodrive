import { dayjs } from "@/loaders/dayjs.ts";

describe("dayjs", () => {
  test("시간을 입력하면, 서울 시간대의 ISO 8601 형식으로 출력해야 한다.", () => {
    // Given
    const dateString = "2024-08-07T20:09:01.497Z";
    const date = dayjs(dateString);

    // When
    const formattedDateString = date.format();

    // Then
    const expectedDateString = "2024-08-08T05:09:01+09:00";
    expect(formattedDateString).toBe(expectedDateString);
  });
});
