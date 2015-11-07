require 'pry'
require 'sinatra'
require 'rest-client'

configure do
  # enable :static
  # set :public_folder, File.dirname(__FILE__) + '/public'
  set(:css_dir) { 'public/css' }
end

get '/' do
  'Hello World'
end

get '/retsly_endpoint' do
  begin
    @backend_response = RestClient::Request.execute(method: :get,
                                                    url: 'http://tejava-python.herokuapp.com/helloworld',
                                                    timeout: 10)
  rescue RestClient::Exceptions::OpenTimeout
    puts '!!!! HEROKU TIMEOUT !!!!'
  end

  erb File.read('views/retsly_frontend.html.erb')
end

get '/javascripts/:file' do
  content_type :js
  File.read("public/javascripts/#{params[:file]}")
end

get '/css/:file' do
  content_type :css
  File.read("public/css/#{params[:file]}")
end
