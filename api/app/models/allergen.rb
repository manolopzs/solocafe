module Allergen
  CODES = %w[
    gluten
    crustaceans
    eggs
    fish
    peanuts
    soybeans
    milk
    nuts
    celery
    mustard
    sesame
    sulphites
    lupin
    molluscs
  ].freeze

  LABELS = {
    "gluten" => "Gluten",
    "crustaceans" => "Crustáceos",
    "eggs" => "Huevos",
    "fish" => "Pescado",
    "peanuts" => "Cacahuetes",
    "soybeans" => "Soja",
    "milk" => "Lácteos",
    "nuts" => "Frutos de cáscara",
    "celery" => "Apio",
    "mustard" => "Mostaza",
    "sesame" => "Sésamo",
    "sulphites" => "Sulfitos",
    "lupin" => "Altramuces",
    "molluscs" => "Moluscos"
  }.freeze

  def self.label(code)
    LABELS[code]
  end
end
