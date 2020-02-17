package com.example.bookseeker.presenter

import android.content.Context
import android.util.Log
import com.example.bookseeker.contract.LoginContract
import com.example.bookseeker.model.data.LoginRequest
import com.example.bookseeker.network.RetrofitClient
import com.google.gson.JsonObject
import io.reactivex.Observable
import okhttp3.OkHttpClient
import java.util.regex.Matcher
import java.util.regex.Pattern


class LoginPresenter : LoginContract.Presenter {
    private var loginView: LoginContract.View? = null

    // takeView : View가 Create, Bind 될 때 Presenter에 전달하는 함수
    override fun takeView(view: LoginContract.View) {
        loginView = view
    }

    // checkRegEx : LoginPresenter에서 EditText의 RegEx를 검사하는 함수
    override fun checkRegEx(txtv: String, etxt: String): String {
        var checkRegExResult = "NONE"
        var matcher: Matcher
        // Email RegEx, Name RegEx(2 ~ 5 digit), Password RegEx(4 ~ 10 digit)
        val EMAIL_REGEX = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE)
        val PASSWORD_REGEX = Pattern.compile("^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{4,10}$", Pattern.CASE_INSENSITIVE)

        when (txtv) {
            "EMAIL" -> {
                matcher = EMAIL_REGEX.matcher(etxt)
                if (matcher.find() == true) {
                    checkRegExResult = "TRUE"
                } else {
                    checkRegExResult = "FALSE"
                }
            }
            "PASSWORD" -> {
                matcher = PASSWORD_REGEX.matcher(etxt)
                if (matcher.find() == true) {
                    checkRegExResult = "TRUE"
                } else {
                    checkRegExResult = "FALSE"
                }
            }
        }
        return checkRegExResult
    }

    // login : View에서 LoginRequest Data를 가져와 로그인 여부를 결정하는 함수
    override fun checkLoginData(context: Context, loginRequest : LoginRequest): Observable<JsonObject> {
        val client: OkHttpClient = RetrofitClient.getClient(context, "receiveCookie")
        val retrofitInterface = RetrofitClient.retrofitInterface(client)

        loginView?.setProgressON("로그인을 진행중입니다...")

        // 데이터가 들어오는지 관찰
        return Observable.create { subscriber ->
            // 데이터 생성을 위한 Create
            val callResponse = retrofitInterface.login(loginRequest)
            val response = callResponse.execute()

            // 성공적으로 응답이 온 경우
            if (response.isSuccessful) {
                val result = response.body()!!

                //TODO : Retrofit Interceptor가 쿠키를 제대로 저장하는지 확인
//                val setCookie = response.headers().get("Set-Cookie")
//                // 만일 쿠키가 있는 경우
//                if(setCookie != null){
//                    val splitCookieHeader = setCookie.split(";")
//                    val splitCookieValue = splitCookieHeader[0].split("=")
//
//                    // ShardPreference에 쿠키 값 집어넣기
//                    val pref = context.getSharedPreferences("shared_pref", 0)
//                    val editor = pref.edit()
//                    editor.putString("cookie", splitCookieValue[1])
//                    editor.apply() // editor.commit()
//                    println("sharedPreference에 저장된 쿠키 값은 : " + pref.getString("cookie", "None"))
//                }

                subscriber.onNext(result)
                subscriber.onComplete() // 구독자에게 모든 데이터 발행이 완료되었음을 알림
            } else {
                subscriber.onError(Throwable(response.message()))
            }
        }
    }

    // dropView : View가 delete, unBind 될 때 Presenter에 전달하는 함수
    override fun dropView() {
        loginView = null
    }

    // executionLog : 공통으로 사용하는 Log 출력 부분을 생성하는 함수
    override fun executionLog(tag: String, msg: String) {
        Log.e(tag, msg)
    }
}