import { Id } from "@/convex/_generated/dataModel";
import { Item, MemberBill } from "./types";

export const formatMoney = (num: number) =>
  "$" + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const splitBill = ({
  total,
  items,
}: {
  total: number;
  items: Array<Item>;
}): Array<MemberBill> => {
  const memberSubtotalDict: { [key: Id<"members">]: number } = {};
  const memberBills: Array<MemberBill> = [];

  const subtotal = items.reduce((acc, item) => acc + item.cost, 0);

  if (subtotal === 0) return [];

  items.forEach((item) => {
    if (item.memberIds.length === 0) return;

    const costPerMember = item.cost / item.memberIds.length;
    item.memberIds.forEach((memberId) => {
      if (memberId in memberSubtotalDict)
        memberSubtotalDict[memberId] += costPerMember;
      else memberSubtotalDict[memberId] = costPerMember;
    });
  });

  Object.entries(memberSubtotalDict).forEach(([key, value]) => {
    memberBills.push({
      memberId: key as Id<"members">,
      bill: (value / subtotal) * total,
    });
  });

  return memberBills;
};
