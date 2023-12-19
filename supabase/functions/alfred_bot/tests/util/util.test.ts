import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import Util from "../../util/util.ts";

interface Dinner {
  id: number;
  chatId: number;
  messageIds: number[];
  date: Date;
  yes: string[];
  no: string[];
}

Deno.test("deepEqual true", () => {
  const testDinner1: Dinner = {
    id: 1,
    chatId: 123,
    messageIds: [1, 2, 3],
    date: new Date("2023-12-19"),
    yes: ["person1", "person2"],
    no: ["person3"],
  };

  const testDinner2: Dinner = {
    id: 1,
    chatId: 123,
    messageIds: [1, 2, 3],
    date: new Date("2023-12-19"),
    yes: ["person1", "person2"],
    no: ["person3"],
  };

  const result: boolean = Util.deepEqual(testDinner1, testDinner2);
  assertEquals(result, true);
});

Deno.test("deepEqual false", () => {
  const testDinner1: Dinner = {
    id: 1,
    chatId: 123,
    messageIds: [1, 2, 3],
    date: new Date("2023-12-19"),
    yes: ["person1", "person2"],
    no: ["person3"],
  };

  const testDinner3: Dinner = {
    id: 2,
    chatId: 1234,
    messageIds: [1, 2],
    date: new Date("2023-12-19"),
    yes: ["person1", "person2"],
    no: ["person3", "person 4"],
  };

  const result: boolean = Util.deepEqual(testDinner1, testDinner3);
  assertEquals(result, false);
});

Deno.test("isObject true", () => {
  const obj: object = {
    field: "value",
  };
  assertEquals(Util.isObject(obj), true);
});

Deno.test("isArray true", () => {
  const array: string[] = ["hello", "world"];
  assertEquals(Util.isArray(array), true);
});

Deno.test("arrayEqual true", () => {
  const array1: string[] = ["hello", "world"];
  const array2: string[] = ["hello", "world"];
  assertEquals(Util.arrayEqual(array1, array2), true);
});

Deno.test("arrayEqual false", () => {
  const array1: string[] = ["hello", "world"];
  const array2: string[] = ["hello", "world", "again"];
  assertEquals(Util.arrayEqual(array1, array2), false);
});
