require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "common validation errors are translated to English" do
    I18n.with_locale(:en) do
      user = User.new(email: "", password: "short")
      user.valid?

      assert_includes user.errors.full_messages, "Email can't be blank"
      assert_includes user.errors.full_messages, "Password is too short (minimum 8 characters)"
    end
  end

  test "common validation errors are still translated to Spanish" do
    I18n.with_locale(:es) do
      user = User.new(email: "", password: "short")
      user.valid?

      assert_includes user.errors.full_messages, "Email no puede estar en blanco"
      assert_includes user.errors.full_messages, "Contraseña es demasiado corta (mínimo 8 caracteres)"
    end
  end

  test "English locale covers the common error keys" do
    I18n.with_locale(:en) do
      %i[taken blank invalid confirmation].each do |key|
        message = I18n.t("errors.messages.#{key}", attribute: "Email", raise: true)
        assert_not_includes message, "Translation missing"
      end
      %i[too_short too_long].each do |key|
        assert_not_includes I18n.t("errors.messages.#{key}", count: 8, raise: true), "Translation missing"
      end
      assert_equal "Password", User.human_attribute_name(:password)
    end
  end

  test "Spanish locale covers the common error keys" do
    I18n.with_locale(:es) do
      %i[taken blank invalid confirmation].each do |key|
        message = I18n.t("errors.messages.#{key}", attribute: "Email", raise: true)
        assert_not_includes message, "Translation missing"
      end
      %i[too_short too_long].each do |key|
        assert_not_includes I18n.t("errors.messages.#{key}", count: 8, raise: true), "Translation missing"
      end
      assert_equal "Contraseña", User.human_attribute_name(:password)
    end
  end
end
