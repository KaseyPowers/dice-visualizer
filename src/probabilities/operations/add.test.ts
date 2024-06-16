import { DataItem, Dice } from "../classes";
import { DataEntryType } from "../types";
import add, { addInner } from "./add";

describe("add items operator", () => {
  it("inner should  add numbers", () => {
    expect(addInner(5, 6)).toBe(5 + 6);
  });

  it("should add a dice to variable", () => {
    const toAdd = 5;
    const diceSize = 4;
    const diceItem = DataItem.getItem("dice", diceSize);
    const toAddItem = new DataItem("var", toAdd);
    // TODO: validate the dice stuff too, but let's assume it's working
    const expectedEntries: DataEntryType[] = [];
    for (let i = 1; i <= diceSize; i += 1) {
      expectedEntries.push([i + toAdd, 1]);
    }
    const expectedDice = new Dice(expectedEntries);
    const results1 = add(diceItem, toAddItem);
    expect(results1.tag).toBe("dice");
    const dice1 = results1.data as Dice;

    expect(dice1.entries).toEqual(expectedDice.entries);

    const results2 = add(toAddItem, diceItem);
    expect(results2.tag).toBe("dice");
    const dice2 = results2.data as Dice;

    expect(dice2.entries).toEqual(dice1.entries);
  });
});
