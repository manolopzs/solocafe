class WcagContrast
  def self.ratio(hex_a, hex_b)
    darker, lighter = [ luminance(hex_a), luminance(hex_b) ].minmax
    (lighter + 0.05) / (darker + 0.05)
  end

  def self.luminance(hex)
    channels = hex.delete_prefix("#").scan(/../).map { |pair| pair.to_i(16) / 255.0 }
    linear = channels.map do |channel|
      if channel <= 0.03928
        channel / 12.92
      else
        ((channel + 0.055) / 1.055)**2.4
      end
    end

    (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2])
  end
end
