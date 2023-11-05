import { Room } from "../types";
import { formatMoney, splitBill } from "../utils";

export function Split({ room }: { room: Room }) {
  const memberBills = splitBill({ total: room.total ?? 0, items: room.items });
  return (
    <>
      {memberBills.map((memberBill, index) => (
        <div key={index}>
          <span className="font-bold">
            {
              room.members.find((member) => member._id === memberBill.memberId)
                ?.name
            }
          </span>
          : <span>{formatMoney(memberBill.bill)}</span>
        </div>
      ))}
    </>
  );
}
