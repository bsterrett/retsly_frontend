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
    @heroku_response = RestClient::Request.execute(method: :get,
                                                    url: 'http://tejava-python.herokuapp.com/helloworld',
                                                    timeout: 10)
  rescue RestClient::Exceptions::OpenTimeout
    puts '!!!! HEROKU TIMEOUT !!!!'
    return {:error => "Heroku Timeout"}.to_json
  end

  {:heroku_response => @heroku_response}.to_json
end

get '/javascripts/:file' do
  content_type :js
  File.read("public/javascripts/#{params[:file]}")
end

get '/css/:file' do
  content_type :css
  File.read("public/css/#{params[:file]}")
end
