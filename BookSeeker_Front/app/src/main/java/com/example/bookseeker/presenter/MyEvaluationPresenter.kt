package com.example.bookseeker.presenter

import android.content.Context
import android.util.Log
import com.example.bookseeker.contract.MyEvaluationContract
import com.example.bookseeker.network.RetrofitClient
import com.example.bookseeker.network.RetrofitClient.retrofitInterface
import com.google.gson.JsonObject
import io.reactivex.Observable
import okhttp3.OkHttpClient


class MyEvaluationPresenter : MyEvaluationContract.Presenter {
    private var myEvaluationView: MyEvaluationContract.View? = null

    // takeView : View가 Create, Bind 될 때 Presenter에 전달하는 함수
    override fun takeView(view: MyEvaluationContract.View) {
        myEvaluationView = view
    }

    // getCountGenreObservable : 장르별 도서 평가 개수 요청을 서버로 보내고 관찰하는 함수
    override fun getCountGenreObservable(context: Context): Observable<JsonObject> {
        val client: OkHttpClient = RetrofitClient.getClient(context, "addCookie")
        val retrofitInterface = retrofitInterface(client)

        return Observable.create { subscriber ->
            // 데이터 생성을 위한 Create
            val callResponse = retrofitInterface.getCountGenre()
            val response = callResponse.execute()

            if (response.isSuccessful) {
                val result = response.body()!!
                subscriber.onNext(result)
                subscriber.onComplete() // 모든 데이터 발행이 완료되었음을 알림
            } else {
                subscriber.onError(Throwable(response.message()))
            }
        }
    }

    // getEvaluationsObservable : 내가 평가한 도서 목록 제약조건을 서버로 보내고 관찰하는 함수
    override fun getEvaluationsObservable(context: Context, genre: String, state: Int, page: Int, limit: Int): Observable<JsonObject> {
        val client: OkHttpClient = RetrofitClient.getClient(context, "addCookie")
        val retrofitInterface = retrofitInterface(client)

        return Observable.create { subscriber ->
            // 데이터 생성을 위한 Create
            val callResponse = retrofitInterface.getEvaluations(genre, state, page, limit)
            val response = callResponse.execute()

            if (response.isSuccessful) {
                val result = response.body()!!
                subscriber.onNext(result)
                subscriber.onComplete() // 모든 데이터 발행이 완료되었음을 알림
            } else {
                subscriber.onError(Throwable(response.message()))
            }
        }
    }

    // dropView : View가 delete, unBind 될 때 Presenter에 전달하는 함수
    override fun dropView() {
        myEvaluationView = null
    }

    // executionLog : 공통으로 사용하는 Log 출력 부분을 생성하는 함수
    override fun executionLog(tag: String, msg: String){
        Log.e(tag, msg)
    }
}