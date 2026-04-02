import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: Request) {

  try {

    const { type } = await req.json()

    // ✅ FIXED cookies usage
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ success:false, error:"unauthorized" })
    }

    // verify jwt
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    )

    const userId = decoded.userId

    // ✅ THIS WILL WORK AFTER prisma generate
    const integration = await prisma.integration.create({

      data: {
        type,
        userId
      }

    })

    return NextResponse.json({

      success:true,
      integration

    })

  }

  catch (error) {

    return NextResponse.json({

      success:false,
      error:"something went wrong"

    })

  }

}