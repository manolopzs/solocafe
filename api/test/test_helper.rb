ENV["RAILS_ENV"] ||= "test"
ENV["STRIPE_WEBHOOK_SECRET"] ||= "whsec_test"
ENV["STRIPE_SECRET_KEY"] ||= "sk_test_" + ("a" * 24)
ENV["JWT_SECRET"] ||= "test-secret"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...

    def capture_rails_logs
      stream = StringIO.new
      previous = Rails.logger
      Rails.logger = ActiveSupport::TaggedLogging.new(ActiveSupport::Logger.new(stream))
      yield
      stream.string
    ensure
      Rails.logger = previous
    end
  end
end
