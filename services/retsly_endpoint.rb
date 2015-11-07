require 'sinatra'
require 'rest-client'

configure do
end

get '/' do
  erb File.read('views/retsly_frontend.html.erb')
end

get '/services/get_caltrain_stations/:id' do
  content_type :json
  begin
    target_url = "http://tejava-python.herokuapp.com/caltrain/random/#{params[:id]}"
    @heroku_response = RestClient::Request.execute(method: :get,
                                                   url: target_url,
                                                   timeout: 10)
    { :heroku_response => @heroku_response }.to_json
  rescue RestClient::Exceptions::OpenTimeout
    puts '!!!! HEROKU TIMEOUT !!!!'
    { :error => 'Heroku Timeout' }.to_json
  end
end

get '/javascripts/:file' do
  content_type :js
  File.read("public/javascripts/#{params[:file]}")
end

get '/css/:file' do
  content_type :css
  File.read("public/css/#{params[:file]}")
end
