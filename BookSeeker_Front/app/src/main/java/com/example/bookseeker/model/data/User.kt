package com.example.bookseeker.model.data

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.android.parcel.Parcelize
import java.io.Serializable

data class RegisterRequest(
    // @SerializedName Annotation :  JSON 응답에서 각각의 필드 구분 위해 사용
    @SerializedName("email") val email: String,
    @SerializedName("nickname") val nickname: String,
    @SerializedName("password") val password: String
) : Serializable

@Parcelize
data class RegisterResponse(
    val user_uid: String,
    val email: String,
    val nickname: String
) : Parcelable{}

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

@Parcelize
data class LoginResponse(
    val email: String,
    val nickname: String,
    val tutorial: Boolean
) : Parcelable{}