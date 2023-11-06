import { Alert } from "@/components/ui/alert";
import { MemberBill } from "../types";
import { formatMoney } from "../utils";
import { AlertTriangleIcon } from "lucide-react";

export function Split({
  total,
  memberBills,
}: {
  total: number;
  memberBills: Array<MemberBill>;
}) {
  const totalFromMemberBills = memberBills.reduce(
    (acc, item) => acc + item.bill,
    0
  );

  return (
    <>
      {Math.abs(total - totalFromMemberBills) > 0.01 && (
        <Alert className="bg-amber-600">
          <div className="flex items-center">
            <AlertTriangleIcon size="1.25em" />
            <div className="mx-2">Something went wrong.</div>
          </div>
        </Alert>
      )}
      {memberBills.map((memberBill, index) => (
        <div key={index}>
          <span className="font-bold">{memberBill.memberName}</span>:{" "}
          <span>{formatMoney(memberBill.bill)}</span>
        </div>
      ))}
      <br />
    </>
  );
}
