import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDomainData } from "@/app/firebase/domain";
import { getStaff } from "@/app/firebase/staffs";
import { CardData, DomainData } from "@/app/types/card";

import { StaffData } from "@/app/types/staff";

type INITIAL_STATE = {
  staffs_loading: boolean;
  current_staff: StaffData | null;
  card_data: CardData | null;
  domain: string | null;
  staff_domain: DomainData | null;
};

const initialState: INITIAL_STATE = {
  current_staff: null,
  staffs_loading: false,
  staff_domain: null,
  domain: null,
  card_data: null,
};

const name = "staffs";

export const asyncGetCurrentStaffDomainData = createAsyncThunk(
  `${name}/asyncGetCurrentStaffDomainData`,
  async ({ domain }: { domain: string | null }) => {
    if (!domain) return null;
    return await getDomainData(domain);
  }
);

export const asyncSetCurrentStaff = createAsyncThunk(
  `${name}/asyncSetCurrentStaff`,
  async ({ uid, vid }: { uid: string; vid: string }) => {
    return await getStaff(uid, vid);
  }
);

const staffSlice = createSlice({
  name,
  initialState,
  reducers: {
    setCurrentDomain: (state, action) => {
      state.domain = action.payload;
    },
    setCardDetails: (state, action) => {
      state.card_data = action.payload;
    },
  },
  extraReducers: (builders) => {
    builders.addCase(asyncGetCurrentStaffDomainData.pending, (state) => {
      state.staffs_loading = true;
    });

    builders.addCase(asyncGetCurrentStaffDomainData.rejected, (state) => {
      state.staffs_loading = false;
    });

    builders.addCase(
      asyncGetCurrentStaffDomainData.fulfilled,
      (state, action) => {
        if (action.payload?.status) {
          state.staff_domain = action.payload?.data;
        }
        state.staffs_loading = false;
      }
    );

    builders.addCase(asyncSetCurrentStaff.pending, (state) => {
      state.staffs_loading = true;
    });

    builders.addCase(asyncSetCurrentStaff.rejected, (state) => {
      state.staffs_loading = false;
    });

    builders.addCase(asyncSetCurrentStaff.fulfilled, (state, action) => {
      if (action.payload && action.payload?.data) {
        state.current_staff = action.payload?.data as StaffData;
      }
      state.staffs_loading = false;
    });
  },
});

export const { setCurrentDomain, setCardDetails } = staffSlice.actions;

export default staffSlice.reducer;
