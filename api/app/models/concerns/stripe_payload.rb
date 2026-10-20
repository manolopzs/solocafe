module StripePayload
  module_function

  def read(object, key)
    return if object.nil?

    string_key = key.to_s
    symbol_key = key.to_sym

    if object.is_a?(Hash)
      return object[string_key] if object.key?(string_key)
      return object[symbol_key] if object.key?(symbol_key)
    end

    if object.respond_to?(:[])
      value = object[string_key]
      return value unless value.nil?
      value = object[symbol_key]
      return value unless value.nil?
    end

    object.public_send(symbol_key) if object.respond_to?(symbol_key)
  rescue NoMethodError, TypeError
    nil
  end
end
