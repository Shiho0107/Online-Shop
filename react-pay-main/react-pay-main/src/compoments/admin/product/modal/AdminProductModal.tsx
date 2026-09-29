import { useEffect, useState } from 'react';
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

import type {
  categoryType,
  productType,
  serieType,
} from '../../../../helpers/type';
import { updateDataAdmin2 } from '../../../../helpers/request';
import { useImagePreview } from '../../../../helpers/hook';

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

interface ModalProps {
  selectedData: productType | null;
  setSelectedData: (data: productType | null) => void;
  refetch: () => void;
  categoryData: categoryType[] | [];
  serieData: serieType[] | [];
}

const AdminProductModal = ({
  selectedData,
  setSelectedData,
  refetch,
  categoryData,
  serieData,
}: ModalProps) => {
  const [form] = Form.useForm();
  const isActive = Form.useWatch('isActive', form);
  const { imagePreview, handleImageChange } = useImagePreview({
    defaultPreview: {
      path: selectedData?.mainImage || '',
      file: null,
    },
  });

  const [fileList, setFileList] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  useEffect(() => {
    if (selectedData) {
      form.setFieldsValue({
        _id: selectedData._id || null,
        name: selectedData.name || '',
        description: selectedData.description || '',
        isActive: selectedData.isActive ?? true,
        specifications: selectedData.specifications,
        category:
          categoryData?.find(
            (item) => item?.name === selectedData?.category?.name
          )?._id ||
          categoryData?.find((item) => item?.name == 'Iphone')?._id ||
          '',
        serie:
          serieData?.find((item) => item?.name === selectedData?.serie?.name)
            ?._id || '',
      });

      // Synchronize multiple images if present
      const productImages = (selectedData as any).images || [];
      if (Array.isArray(productImages)) {
        setFileList(
          productImages.map((url: string, index: number) => ({
            uid: `-prod-img-${index}`,
            name: `image-${index}`,
            status: 'done',
            url: url,
          }))
        );
      } else {
        setFileList([]);
      }
    } else {
      setFileList([]);
    }
  }, [selectedData, form]);

  const onOk = () => {
    form.resetFields();
    setFileList([]);
    handleImageChange(null);
    setSelectedData(null);
  };

  const onFinish: FormProps<productType>['onFinish'] = async (values) => {
    try {
      const url = values._id ? `products/${values._id}` : 'products/';
      const type = values._id ? 'put' : 'post';

      const dataProduct = new FormData();
      dataProduct.append('name', values.name);
      dataProduct.append('description', values.description || '');
      dataProduct.append('isActive', values.isActive ? 'true' : 'false');
      dataProduct.append(
        'specifications',
        JSON.stringify(values.specifications)
      );
      dataProduct.append('category', String(values?.category));
      dataProduct.append('serie', String(values?.serie));
      if (Object(imagePreview)?.file) {
        dataProduct.append('mainImage', Object(imagePreview)?.file);
      }
      const newFiles = fileList.filter((file) => file.originFileObj);

      newFiles.forEach((file) => {
        dataProduct.append('images', file.originFileObj);
      });

      if (type === 'put') {
        const oldFiles = fileList
          .filter((file) => !file.originFileObj)
          .map((file) => file.url);
        const result = oldFiles.map((url) => {
          const match = url.match(/(Pay\/.*?)\.webp/);
          return match ? match[1] : null;
        });
        dataProduct.append('deleteImageUrls', JSON.stringify(oldFiles));
        dataProduct.append('deleteImagePublicIds', JSON.stringify(result));
      }
      // return;
      const res = await updateDataAdmin2(url, dataProduct, type);
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
        title={selectedData?._id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
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
              <Form.Item<productType>
                // label="Tên sản phẩm"
                hidden
                name="_id"
                initialValue={selectedData?._id || null}
              >
                <Input />
              </Form.Item>

              <Form.Item<productType>
                label="Tên sản phẩm"
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên sản phẩm !' },
                  { min: 4, message: 'Tên sản phẩm tối thiểu 4 ký tự !' },
                  { max: 20, message: 'Tên sản phẩm tối đa 20 ký tự !' },
                ]}
              >
                <Input className="h-10" />
              </Form.Item>

              <Form.Item<productType>
                label="Mô Tả"
                name="description"
                rules={[
                  { min: 4, message: 'Mô tả tối thiểu 4 ký tự !' },
                  //   { max: 20, message: 'Mô tả tối đa 20 ký tự !' },
                ]}
              >
                <Input.TextArea />
              </Form.Item>

              <div className="grid grid-cols-2 gap-3">
                <Form.Item label="Danh mục" name="category">
                  <Select placeholder="Chọn danh mục">
                    {categoryData?.map((item) => (
                      <Select.Option key={item._id} value={item._id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Serie" name="serie">
                  <Select placeholder="Chọn Serie">
                    {serieData?.map((item) => (
                      <Select.Option key={item._id} value={item._id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thông số kỹ thuật
                </label>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">
                          Thông số
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Giá trị
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 align-middle">
                          Màn hình
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <Form.Item<productType>
                            name={['specifications', 'screen']}
                            className="mb-0"
                            rules={[
                              {
                                required: true,
                                message: 'Vui lòng nhập thông số màn hình !',
                              },
                            ]}
                          >
                            <Input
                              className="h-9 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg border-gray-200"
                              placeholder="Nhập thông số màn hình..."
                            />
                          </Form.Item>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 align-middle">
                          Camera Sau
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <Form.Item<productType>
                            name={['specifications', 'rearCamera']}
                            className="mb-0"
                            rules={[
                              {
                                required: true,
                                message: 'Vui lòng nhập thông số camera sau !',
                              },
                            ]}
                          >
                            <Input
                              className="h-9 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg border-gray-200"
                              placeholder="Nhập thông số camera sau..."
                            />
                          </Form.Item>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 align-middle">
                          Camera Trước
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <Form.Item<productType>
                            name={['specifications', 'frontCamera']}
                            className="mb-0"
                            rules={[
                              {
                                required: true,
                                message:
                                  'Vui lòng nhập thông số camera trước !',
                              },
                            ]}
                          >
                            <Input
                              className="h-9 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg border-gray-200"
                              placeholder="Nhập thông số camera trước..."
                            />
                          </Form.Item>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 align-middle">
                          Chip
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <Form.Item<productType>
                            name={['specifications', 'chip']}
                            className="mb-0"
                            rules={[
                              {
                                required: true,
                                message: 'Vui lòng nhập thông số chip !',
                              },
                            ]}
                          >
                            <Input
                              className="h-9 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg border-gray-200"
                              placeholder="Nhập tên chip..."
                            />
                          </Form.Item>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-600 align-middle">
                          Pin
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <Form.Item<productType>
                            name={['specifications', 'battery']}
                            className="mb-0"
                            rules={[
                              {
                                required: true,
                                message: 'Vui lòng nhập thông số pin !',
                              },
                            ]}
                          >
                            <Input
                              className="h-9 hover:border-blue-400 focus:border-blue-500 transition-colors rounded-lg border-gray-200"
                              placeholder="Nhập dung lượng pin..."
                            />
                          </Form.Item>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
                  Hình ảnh đại diện sản phẩm
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

              <div className="mt-6 border-t border-gray-100 p-4">
                <span className="block text-sm font-semibold text-gray-700 mb-3">
                  Hình ảnh chi tiết sản phẩm
                </span>
                <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-50 hover:border-blue-400 transition-all duration-200">
                  <Upload
                    multiple
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    beforeUpload={() => false}
                    className="w-full"
                    accept=".jpg,.jpeg,.png,.webp"
                  >
                    {fileList.length >= 8 ? null : (
                      <div className="flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-colors duration-200 cursor-pointer">
                        <PlusOutlined className="text-xl mb-1.5" />
                        <div className="text-xs font-semibold">Tải ảnh lên</div>
                        <div className="text-[10px] text-gray-400 mt-1 font-normal">
                          Tối đa 8 ảnh
                        </div>
                      </div>
                    )}
                  </Upload>
                </div>

                <Modal
                  open={previewOpen}
                  title="Xem chi tiết ảnh"
                  footer={null}
                  onCancel={() => setPreviewOpen(false)}
                >
                  <img
                    alt="Xem trước ảnh"
                    className="w-full h-auto rounded-xl object-contain shadow-md"
                    src={previewImage}
                  />
                </Modal>
              </div>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AdminProductModal;
