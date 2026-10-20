require "test_helper"

class ShopPersonalityTest < ActiveSupport::TestCase
  test "defaults to a contrast safe brand color and the DM Sans display font" do
    shop = Shop.create!(name: "Default", slug: "default-personality", currency: "MXN")

    assert_equal "#8c3d25", shop.brand_color
    assert_equal "dm_sans", shop.display_font
    assert_equal "DM Sans", Shop::DISPLAY_FONTS[shop.display_font]
  end

  test "accepts a curated display font and a color with WCAG AA contrast" do
    shop = Shop.create!(
      name: "Verde",
      slug: "verde",
      currency: "MXN",
      brand_color: "#1F4D3A",
      display_font: "fraunces"
    )

    assert shop.valid?
    assert_equal "#1f4d3a", shop.brand_color
    assert_equal "Fraunces", Shop::DISPLAY_FONTS[shop.display_font]
  end

  test "rejects a brand color without WCAG AA contrast on the cream canvas" do
    shop = Shop.new(name: "Claro", slug: "claro", currency: "MXN", brand_color: "#c17c5b")

    assert_not shop.valid?
    assert_includes shop.errors.full_messages.join(" "), "contraste WCAG AA"
  end

  test "rejects white and short hex colors" do
    white = Shop.new(name: "Blanco", slug: "blanco", currency: "MXN", brand_color: "#ffffff")
    short = Shop.new(name: "Corto", slug: "corto", currency: "MXN", brand_color: "#fff")

    assert_not white.valid?
    assert_not short.valid?
    assert_includes short.errors.full_messages.join(" "), "hexadecimal"
  end

  test "rejects a display font outside the curated list" do
    shop = Shop.new(name: "Comic", slug: "comic", currency: "MXN", display_font: "comic_sans")

    assert_not shop.valid?
    assert_includes shop.errors.full_messages.join(" "), "tipografía"
  end

  test "curated display fonts stay a small client agnostic catalog" do
    assert_equal(
      %w[dm_sans fraunces literata newsreader libre_baskerville],
      Shop::DISPLAY_FONTS.keys
    )
  end

  test "rejects a hero photo that is not a jpeg png or webp" do
    shop = Shop.create!(name: "Foto", slug: "foto", currency: "MXN")
    shop.hero_photo.attach(
      io: File.open(file_fixture("notes.txt")),
      filename: "notes.txt",
      content_type: "text/plain"
    )

    assert_not shop.valid?
    assert_includes shop.errors.full_messages.join(" "), "JPG, PNG o WebP"
  end

  test "rejects a hero photo larger than 5 MB" do
    shop = Shop.create!(name: "Grande", slug: "grande", currency: "MXN")
    shop.hero_photo.attach(
      io: File.open(file_fixture("hero.png")),
      filename: "hero.png",
      content_type: "image/png"
    )
    shop.hero_photo.blob.update!(byte_size: 6.megabytes)

    assert_not shop.valid?
    assert_includes shop.errors.full_messages.join(" "), "5 MB"
  end

  test "accepts a png hero photo" do
    shop = Shop.create!(name: "Portada", slug: "portada", currency: "MXN")
    shop.hero_photo.attach(
      io: File.open(file_fixture("hero.png")),
      filename: "hero.png",
      content_type: "image/png"
    )

    assert shop.valid?
    assert shop.hero_photo.attached?
  end
end
