// pages/api/hello.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export const GET = (req: NextApiRequest, res: NextApiResponse) => {
  return NextResponse.json(
    {
      message: "From NextJS",
    },
    { status: 200 }
  );
};
