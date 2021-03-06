package com.example.bookseeker.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.RatingBar
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.bookseeker.R
import com.example.bookseeker.model.data.BookData
import kotlinx.android.synthetic.main.item_recv_rating.view.*


class RatingDelegateAdapter(val viewActions: onViewSelectedListener) : ViewTypeDelegateAdapter {
    interface onViewSelectedListener {
        fun onItemSelected(bookData: BookData)
        fun onRatingBarChangeListener(bookData: BookData, position: Int, ratingBar: RatingBar, float: Float, boolean: Boolean)
    }

    override fun onCreateViewHolder(parent: ViewGroup): RecyclerView.ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_recv_rating, parent, false)
        return RatingDelegateViewHolder(view)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, item: ViewType, position: Int) {
        holder as RatingDelegateViewHolder
        holder.bind(item as BookData, position)
    }

    inner class RatingDelegateViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        fun bind(bookData: BookData, position: Int) = with(itemView) {
            var splitUrl = bookData.cover.split("/")
            var coverUrl: String = "https://img.ridicdn.net/cover/" + splitUrl[4] + "/xlarge"

            Glide.with(itemView.context).load(coverUrl).into(recv_rating_item_imgv_book)
            recv_rating_item_txtv_booktitle.text = bookData.title
            recv_rating_item_txtv_author.text = bookData.author
            recv_rating_item_txtv_publisher.text = bookData.publisher
            if(bookData.rating < 0){
                recv_rating_item_ratingbar_bookrating.rating = 0.0f
            } else {
                recv_rating_item_ratingbar_bookrating.rating = bookData.rating
            }

            super.itemView.setOnClickListener { viewActions.onItemSelected(bookData) }
            super.itemView.recv_rating_item_ratingbar_bookrating.onRatingBarChangeListener =
                RatingBar.OnRatingBarChangeListener { ratingBar: RatingBar, float: Float, boolean: Boolean ->
                    viewActions.onRatingBarChangeListener(bookData, position, ratingBar, float, boolean)
                }
        }
    }
}