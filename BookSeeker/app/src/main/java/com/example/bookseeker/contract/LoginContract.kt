package com.example.bookseeker.contract

import com.example.bookseeker.presenter.BasePresenter
import com.example.bookseeker.view.BaseView

interface LoginContract {
    interface View : BaseView {
<<<<<<< HEAD
        // setLoginButtonEventListener : LoginActivity에서 Button Event를 처리하는 함수
        fun setButtonEventListener()

        // setTextViewEventListener : LoginActivity에서 TextView Event를 처리하는 함수
        fun setTextViewEventListener()

        // setEditTextEventListener : SignUpActivity에서 EditText Event를 처리하는 함수
        fun setEditTextEventListener()

        // startSearchActivity : LoginActivity에서 SearchActivity로 넘어가는 함수
        fun startSearchActivity()

        // startSignUpActivity : LoginActivity에서 SignUpActivity로 넘어가는 함수
        fun startSignUpActivity()
    }

    interface Presenter : BasePresenter<View> {
        // checkRegEx : LoginPresenter에서 EditText의 RegEx를 검사하는 함수
        fun checkRegEx(txtv: String, etxt: String): String

        // checkLoginData : LoginPresenter에서 Email과 Password의 일치 여부를 비교하는 함수
        fun checkLoginData(inputEmail: String, inputPassword: String)
=======
        // startSearchActivity : LoginActivity에서 SearchActivity로 넘어가는 함수
        fun startSearchActivity ()
    }
    interface Presenter : BasePresenter<View> {
        // loginCheck : View에서 Email과 Password를 받아와 일치 여부를 비교하는 함수
        fun loginCheck (inputEmail: String?, inputPassword: String?): Int
>>>>>>> 17feb1f3afe9a5d4ca132a30ace1d53c1d8d1cae
    }
}