package com.viethai.demo

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.gson.Gson
import kotlinx.android.synthetic.main.main_activity.*



class MainActivity : AppCompatActivity() {
  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.main_activity)
    val module = ExampleModule()
    val moduleBridge = ExampleModuleBridge(this.web_view, module, Gson())

    this.web_view.apply {
      this.settings.apply { this.javaScriptEnabled = true }
      this.addJavascriptInterface(moduleBridge, "ExampleModule")
      this.loadUrl("http://10.0.2.2:8000")
    }
  }

  override fun onPause() {
    super.onPause()
    this.web_view.onPause()
  }

  override fun onResume() {
    super.onResume()
    this.web_view.onResume()
  }
}