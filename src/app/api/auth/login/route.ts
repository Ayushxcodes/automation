import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const { email, password } = body

    // check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {

      return NextResponse.json({
        success:false,
        error:"Invalid credentials"
      })

    }

    // compare password
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {

      return NextResponse.json({
        success:false,
        error:"Invalid credentials"
      })

    }

    // create jwt token
    const token = jwt.sign(

      { userId: user.id },

      process.env.JWT_SECRET!,

      { expiresIn:"7d" }

    )

    const response = NextResponse.json({

      success:true

    })

    // store token in cookie
    response.cookies.set("token", token, {

      httpOnly:true,
      secure:false,
      path:"/",
      maxAge:60*60*24*7

    })

    return response

  }

  catch (error) {

    return NextResponse.json({

      success:false

    })

  }

}