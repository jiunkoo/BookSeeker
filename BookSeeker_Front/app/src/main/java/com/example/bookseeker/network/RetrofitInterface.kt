package com.example.bookseeker.network

import com.example.bookseeker.model.data.*
import com.google.gson.JsonObject
import retrofit2.Call
import retrofit2.http.*

interface RetrofitInterface {
    // 회원가입
    @POST("/users/register")
    fun register(@Body register: Register): Call<JsonObject>

    // 로그인
    @POST("/users/login")
    fun login(@Body login: Login): Call<JsonObject>

    // 마이페이지 조회
    @GET("/users/mine")
    fun getMine() : Call <JsonObject>

    // 도서 검색
    @POST("/books/search/{filter}/{page}/{limit}")
    fun booksSearch(@Body booksSearch: BooksSearch, @Path("filter") filter: Int,
                    @Path("page") page: Int, @Path("limit") limit: Int): Call<JsonObject>

    // 모든 도서 조회
    @GET("/books/{genre}/{filter}/{page}/{limit}")
    fun getBooks(@Path("genre") genre: String, @Path("filter") filter: Int,
                 @Path("page") page: Int, @Path("limit") limit: Int): Call<JsonObject>

    // 하나의 도서 조회
    @GET("/books/{bsin}")
    fun getBook(@Path("bsin") bsin: String): Call<JsonObject>

    // 도서 키워드 조회
    @GET("/books/keyword/{limit}")
    fun getKeyword(@Path("limit") limit: Int): Call<JsonObject>

    // 하나의 평가 데이터 생성
    @POST("/evaluation")
    fun createEvaluation(@Body evaluationCreate: EvaluationCreate): Call<JsonObject>

    // 모든 평가 데이터 조회
    @GET("evaluation/{genre}/{state}/{page}/{limit}")
    fun getEvaluations(@Path("genre") genre: String, @Path("state") state: Int,
                       @Path("page") page: Int, @Path("limit") limit: Int): Call<JsonObject>

    // 장르별 도서 평가 개수 조회
    @GET("/evaluation/count/genre")
    fun getCountGenre(): Call<JsonObject>

    // 상태별 도서 평가 개수 조회
    @GET("/evaluation/count/state")
    fun getCountState(): Call<JsonObject>

    // 평점별 도서 평가 개수 조회
    @GET("/evaluation/count/rating")
    fun getCountRating(): Call<JsonObject>

    // 하나의 평가 데이터 수정
    @PATCH("/evaluation")
    fun patchEvaluation(@Body evaluationPatch: EvaluationPatch): Call<JsonObject>

    // 하나의 평가 데이터 삭제
    @DELETE("/evaluation/{bsin}")
    fun deleteEvaluation(@Path("bsin") bsin: String): Call<JsonObject>

    // 추천 도서 조회
    @GET("/recommend/{genre}/{page}/{limit}")
    fun getRecommend(@Path("genre") genre: String, @Path("page") page: Int,
                     @Path("limit") limit: Int): Call<JsonObject>
}
