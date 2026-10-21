require "test_helper"
require Rails.root.join("config/active_storage_config")

class ActiveStorageConfigTest < ActiveSupport::TestCase
  test "R2 credentials select the cloudflare service" do
    env = {
      "R2_ACCOUNT_ID" => "acct",
      "R2_ACCESS_KEY_ID" => "key",
      "R2_SECRET_ACCESS_KEY" => "secret",
      "R2_BUCKET" => "solocafe"
    }

    assert ActiveStorageConfig.configured?(env)
    assert_equal :cloudflare, ActiveStorageConfig.service_name(env)
  end

  test "missing R2 credentials fall back to local disk" do
    env = {
      "R2_ACCOUNT_ID" => "acct",
      "R2_ACCESS_KEY_ID" => "",
      "R2_SECRET_ACCESS_KEY" => "secret",
      "R2_BUCKET" => "solocafe"
    }

    assert_not ActiveStorageConfig.configured?(env)
    assert_equal :local, ActiveStorageConfig.service_name(env)
    assert_equal :local, ActiveStorageConfig.service_name({})
  end

  test "cloudflare storage reads R2 settings from the environment" do
    previous = r2_env
    ENV["R2_ACCOUNT_ID"] = "acct"
    ENV["R2_ACCESS_KEY_ID"] = "key"
    ENV["R2_SECRET_ACCESS_KEY"] = "secret"
    ENV["R2_BUCKET"] = "solocafe"

    service = load_storage.fetch("cloudflare")

    assert_equal "S3", service["service"]
    assert_equal "auto", service["region"]
    assert_equal "https://acct.r2.cloudflarestorage.com", service["endpoint"]
    assert_equal "key", service["access_key_id"]
    assert_equal "secret", service["secret_access_key"]
    assert_equal "solocafe", service["bucket"]
    assert_equal true, service["force_path_style"]
    assert_equal "when_required", service["request_checksum_calculation"]
    assert_equal "when_required", service["response_checksum_validation"]
  ensure
    restore_r2_env(previous)
  end

  private

  def load_storage
    YAML.safe_load(ERB.new(File.read(Rails.root.join("config/storage.yml"))).result, aliases: true)
  end

  def r2_env
    %w[R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET].index_with { |key| ENV[key] }
  end

  def restore_r2_env(previous)
    return if previous.nil?

    previous.each do |key, value|
      value.nil? ? ENV.delete(key) : ENV[key] = value
    end
  end
end
