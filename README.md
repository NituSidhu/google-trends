# Visualizing Google Trends in a more Insightful Way
[Google trends](https://trends.google.com/trends/?geo=US) is a great tool for digital marketers as it allows you to see what the world is searching. You enter in a topic or keyword and you can see how demand for that phrase has looked over the past 4 hours, day, week, month, year and even up to the past 5 years. You can also add geographic parameters by seeing trends over the whole world down to a city. 

## The Problem
Although the features outlined are great, the visuals can be lacking when you're not looking up terms like rompers or Antonio Brown from the past year. Here's an example below:

![google trends](https://www.hallaminternet.com/wp-content/uploads/2018/11/Using-Google-Trends.jpg)

Can you spot and find what time of the year SEO and AdWords is searched for the most? You can't by looking at this graph.

For example, I ran into this case where a new business owner wanted to see the time of year where doctors most often start looking for medical billing services. You pull up the graph, but it's hard to detect seasonality. 

However, luckily Google allows you to export what you search.

## The Solution

So I wrote up a Python script that you can export for yourself. All you have to do is:
1. Search your topic on Google Trends
2. Select the time period you want to analyze (I recommend going as far back as you can "2004-present")
3. Click the download icon on the top right of the graph
4. Download and open the google-trends-analysis.ipynb file in this repo
5. Insert the name of the file and hit run 

(Optional) Update the titles of the graphs if you will be presenting this

It may be worth having some familiarity with Python, just so you have the tools. But this is very easy as all you have to do is change the name of the file and everything populates for you from Quarterly, Yearly, and Monthly breakdowns.

## What You'll Get
Detect which months prospects are searching for services like yours:
![monthly breakdown](https://imgur.com/yTdmxam)

Help forecast the year and get quarterly trends:
![quarter breakdown](https://imgur.com/xLPXOph)

See how your topic has been performing on a year-by-year basis:
![yearly breakdown](https://imgur.com/cOfsKjP)

If you have any requests, please reach me at yaguneetsidhu@gmail.com.
