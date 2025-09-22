// import { useState, useEffect } from "react";
// import { getPaymentsByContractId } from "../../services/payment.service";
// import { getContractIncreasesByContract } from "../../services/contractIncrease.service";
// import type { Payment } from "../../types/payment";
// import type { ContractIncrease } from "../../types/contractIncrease";
// import type { Contract } from "../../types/contract";

// export function useContractHistory(
//   contract: Contract | null,
//   refreshFlag: number
// ) {
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [increases, setIncreases] = useState<ContractIncrease[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect(() => {
//     if (!contract) return;
//     setLoading(true);
//     Promise.all([
//       getPaymentsByContractId(contract.id),
//       getContractIncreasesByContract(contract.id),
//     ])
//       .then(([p, inc]) => {
//         setPayments(p);
//         setIncreases(inc);
//       })
//       .finally(() => setLoading(false));
//   }, [contract, refreshFlag]); // Añadimos `refreshFlag` como dependencia para forzar recarga

//   return { payments, increases, loading };
// }
