import { useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Upload,
  type FormProps,
} from 'antd';
import { toast } from 'react-toastify';
import {
  CloseCircleOutlined,
  SaveOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { HiOutlineXCircle } from 'react-icons/hi';

import type { productType, productVariantType } from '../../../../helpers/type';
import { updateDataAdmin2 } from '../../../../helpers/request';
import { useImagePreview } from '../../../../helpers/hook';
import {
  convertNameSku,
  removeVietnameseTones,
} from '../../../../helpers/func';

interface ModalProps {
  selectedData: productVariantType | null;
  setSelectedData: (data: productVariantType | null) => void;
  refetch: () => void;
  productData: productType[];
}

const AdminProductModal = ({
  selectedData,
  setSelectedData,
  refetch,
  productData,
}: ModalProps) => {
  const [form] = Form.useForm();
  const isActive = Form.useWatch('isActive', form);
  const { imagePreview, handleImageChange } = useImagePreview({
    defaultPreview: {
      path: selectedData?.imageColor || '',
      file: null,
    },
  });

  const product = Form.useWatch('product', form);
  const color = Form.useWatch('color', form);
  const storage = Form.useWatch('storage', form);

  useEffect(() => {
    const productName =
      productData?.find((item: productType) => item._id === product)?.name ||
      '';
    const skuProduct = convertNameSku(productName);
    const skuColor = color
      ? removeVietnameseTones(color.split(' ')[0].toUpperCase())
      : '';
    const skuStorage = storage || '';
    const sku = `${skuProduct}-${skuColor}-${skuStorage}`;
    form.setFieldsValue({ sku });
  }, [product, color, storage, productData, form]);

  useEffect(() => {
    if (selectedData) {
      form.setFieldsValue({
        _id: selectedData._id || null,
        isActive: selectedData.isActive ?? true,
        originalPrice: selectedData.originalPrice,
        price: selectedData.price,
        color: selectedData.color,
        storage: selectedData.storage,
        stock: selectedData.stock,
        condition: selectedData.condition,
        sku: selectedData.sku,
        product: selectedData?.product?._id || '',
      });
    }
  }, [selectedData, form]);

  const onOk = () => {
    form.resetFields();
    handleImageChange(null);
    setSelectedData(null);
  };

  const onFinish: FormProps<productVariantType>['onFinish'] = async (
    values
  ) => {
    // console.log(values);
    // return;
    try {
      const url = values._id
        ? `product-variants/${values._id}`
        : 'product-variants/';
      const type = values._id ? 'put' : 'post';

      const dataProductVariant = new FormData();

      dataProductVariant.append('isActive', values.isActive ? 'true' : 'false');
      dataProductVariant.append('originalPrice', values.originalPrice);
      dataProductVariant.append('price', values.price);
      dataProductVariant.append('color', values.color);
      dataProductVariant.append('storage', values.storage);
      dataProductVariant.append('stock', values.stock);
      dataProductVariant.append('condition', values.condition);
      dataProductVariant.append('productMainId', String(values.product));
      if (Object(imagePreview)?.file) {
        dataProductVariant.append('imageColor', Object(imagePreview)?.file);
      }

      // return;
      const res = await updateDataAdmin2(url, dataProductVariant, type);
      if (res) {
        toast.success('Thành công !');
        onOk();
        refetch();
      }
    } catch (error) {
      toast.error('Lỗi xảy ra !');
      console.log('onFinish error :', error);
    }
  };

  return (
    <>
      <Modal
        // width={'1200px'}
        className="w-[1200px]!"
        title={
          selectedData?._id ? 'Sửa biến thể sản phẩm' : 'Thêm biến thể sản phẩm'
        }
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={selectedData !== null}
        onOk={() => onOk()}
        onCancel={() => onOk()}
        footer={[
          <Button key="back" danger onClick={onOk} size="large">
            <CloseCircleOutlined />
            Huỷ
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            size="large"
          >
            <SaveOutlined />
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={form}
          name="categoryForm"
          layout="vertical"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={onFinish}
          autoComplete="off"
          className="overflow-auto h-[calc(100vh-250px)]"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Form.Item label="Sản phẩm" name="product">
                <Select
                  placeholder="Chọn danh mục"
                  className="h-12!"
                  showSearch={{
                    optionFilterProp: 'label',
                    filterSort: (optionA, optionB) =>
                      String(optionA.label)
                        .toLowerCase()
                        .localeCompare(String(optionB.label).toLowerCase()),
                  }}
                >
                  {productData?.map((item) => (
                    <Select.Option
                      key={item._id}
                      value={item._id}
                      label={String(item.name)}
                    >
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item<productVariantType>
                // label="Tên sản phẩm"
                hidden
                name="_id"
                initialValue={selectedData?._id || null}
              >
                <Input />
              </Form.Item>

              <Form.Item<productVariantType> label="Mã biến thể" name="sku">
                <Input readOnly />
              </Form.Item>

              <div className="grid grid-cols-3 gap-2">
                <Form.Item<productVariantType> label="Màu" name="color">
                  <Input />
                </Form.Item>

                <Form.Item<productVariantType> label="Bộ nhớ" name="storage">
                  <Select placeholder="Chọn bộ nhớ">
                    <Select.Option value="128GB">128GB</Select.Option>
                    <Select.Option value="256GB">256GB</Select.Option>
                    <Select.Option value="512GB">512GB</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item<productVariantType>
                  label="Giá gốc"
                  name="originalPrice"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập giá gốc',
                    },
                    {
                      pattern: /^[0-9]+$/,
                      message: 'Giá gốc phải là số',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<productVariantType>
                  label="Giá ưu đãi"
                  name="price"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập giá ưu đãi',
                    },
                    {
                      pattern: /^[0-9]+$/,
                      message: 'Giá ưu đãi phải là số',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<productVariantType>
                  label="Số lượng"
                  name="stock"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập số lượng',
                    },
                    {
                      pattern: /^[0-9]+$/,
                      message: 'Số lượng phải là số',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<productVariantType>
                  label="Tình trạng"
                  name="condition"
                >
                  <Select placeholder="Chọn bộ nhớ">
                    <Select.Option value="New">New</Select.Option>
                    <Select.Option value="99%">99%</Select.Option>
                    <Select.Option value="98%">98%</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <Form.Item label="Tình trạng">
                <Space>
                  <Form.Item name="isActive" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                  <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </Tag>
                </Space>
              </Form.Item>
            </div>
            <div>
              <div className="mt-6 border-t border-gray-100 p-4">
                <span className="block text-sm font-semibold text-gray-700 mb-3">
                  Hình ảnh đại diện biến thể sản phẩm
                </span>
                <div className="flex justify-center items-center p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-50 hover:border-blue-400 transition-all duration-200">
                  <Upload
                    name="product-image"
                    listType="picture-card"
                    className="avatar-uploader flex! justify-center items-center w-full"
                    showUploadList={false}
                    // beforeUpload={() => false}
                    onChange={(info) => {
                      if (info.file?.originFileObj) {
                        handleImageChange(info.file.originFileObj);
                      }
                    }}
                    accept=".jpg,.jpeg,.png,.webp"
                  >
                    {Object(imagePreview)?.path ? (
                      <div className="relative group w-full h-full flex items-center justify-center rounded-lg overflow-hidden">
                        <img
                          src={Object(imagePreview)?.path}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageChange(null);
                            }}
                            className="bg-white/95 text-red-500 p-2 rounded-full hover:bg-white hover:scale-110 transition-all cursor-pointer shadow-md"
                            title="Xoá ảnh"
                          >
                            <HiOutlineXCircle className="text-2xl" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-colors duration-200 cursor-pointer">
                        <PlusOutlined className="text-xl mb-1.5" />
                        <div className="text-xs font-semibold">Tải ảnh lên</div>
                      </div>
                    )}
                  </Upload>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AdminProductModal;
