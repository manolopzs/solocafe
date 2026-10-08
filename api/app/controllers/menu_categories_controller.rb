class MenuCategoriesController < ApplicationController
  before_action :authenticate_user!
  before_action :require_shop_member!, only: [:create, :update, :destroy]
  before_action :set_current_shop!, only: [:index]

  def index
    categories = Current.shop.menu_categories.order(:sort_order)
    render json: { categories: categories.map { |c| category_payload(c) } }
  end

  def create
    category = Current.shop.menu_categories.build(category_params)
    if category.save
      render json: { category: category_payload(category) }, status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    category = Current.shop.menu_categories.find(params[:id])
    if category.update(category_params)
      render json: { category: category_payload(category) }
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    category = Current.shop.menu_categories.find(params[:id])
    category.destroy
    head :no_content
  end

  private

  def category_params
    params.require(:category).permit(:name, :sort_order, :is_active)
  end

  def category_payload(category)
    {
      id: category.id,
      name: category.name,
      sort_order: category.sort_order,
      is_active: category.is_active
    }
  end
end
