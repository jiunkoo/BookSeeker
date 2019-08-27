package com.example.bookseeker.view

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

abstract class BaseActivity : AppCompatActivity(){
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        initPresenter()
    }
    // initPresenter : View와 상호작용할 Presenter를 주입하기 위한 함수
    abstract fun initPresenter()
<<<<<<< HEAD

    fun progressON() {
        BaseApplication.instance.progressON(this, null!!)
    }

    fun progressON(message: String) {
        BaseApplication.instance.progressON(this, message)
    }

    fun progressOFF() {
        BaseApplication.instance.progressOFF()
    }
=======
>>>>>>> 17feb1f3afe9a5d4ca132a30ace1d53c1d8d1cae
}