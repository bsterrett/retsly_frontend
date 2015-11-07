require 'pry'
require 'sinatra'
require 'rest-client'

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
