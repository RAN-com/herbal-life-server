"use client";
// app/page.tsx
import React from "react";
import {
  asyncGetCurrentStaffDomainData,
  asyncSetCurrentStaff,
  setCardDetails,
  setCurrentDomain,
} from "../redux/features/user/card";
import { useAppSelector, useAppDispatch } from "../redux/store/hook";
import PreviewScreen from "../component/preview";
import moment from "moment";
import { getCardDetail } from "../firebase/card";
import NotFound from "../app/not-found";
// Using a server component to fetch subdomain from the headers
export default function MainPage({ domain }: { domain: string | null }) {
  const dispatch = useAppDispatch();
  const current_domain = useAppSelector((s) => s.card.staff_domain);
  const card_details = useAppSelector((s) => s.card.card_data);

  React.useEffect(() => {
    // if (!existing_domain || existing_domain === domain) {
    dispatch(setCurrentDomain(domain));
    dispatch(asyncGetCurrentStaffDomainData({ domain }));
    // }
  }, [domain]);

  React.useEffect(() => {
    if (
      current_domain &&
      current_domain?.subscription &&
      moment().isBefore(moment(current_domain?.subscription?.valid_till))
    ) {
      dispatch(
        asyncSetCurrentStaff({
          uid: current_domain?.created_by,
          vid: current_domain?.staff_id,
        })
      );
      getCardDetail(current_domain?.staff_id)
        .then(({ data }) => {
          if (data) {
            dispatch(setCardDetails(data));
          }
        })
        .catch(console.log);
    }
  }, [current_domain]);

  return card_details && domain ? (
    <PreviewScreen domain={domain} />
  ) : (
    <NotFound />
  );
}
