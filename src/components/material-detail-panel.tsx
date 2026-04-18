import type { AssetRecord } from '../shared/types/asset'

export function MaterialDetailPanel({ asset }: { asset: AssetRecord | null }) {
  if (!asset) {
    return <p>请选择素材</p>
  }

  const categoryLabelMap = {
    problem: '问题展示',
    demo: '操作过程',
    detail: '细节展示',
    result: '结果展示',
  } as const

  return (
    <>
      <h3>素材详情</h3>
      <p>{asset.fileName}</p>
      <p>源文件：{asset.sourcePath}</p>
      <p>时长：{Math.round(asset.durationMs / 1000)} 秒</p>
      <p>分辨率：{asset.width && asset.height ? `${asset.width} × ${asset.height}` : '待探测'}</p>
      <p>主分类：{categoryLabelMap[asset.category]}</p>
      <p>分类原因：{asset.categoryReason ?? '当前未记录分类原因'}</p>
      <p>质量分：{asset.qualityScore}</p>
      <p>状态：{asset.status}</p>
      <p>相似组：{asset.similarGroupId ?? '未分组'}</p>
      <p>缩略图：{asset.thumbnailPath ?? '未生成'}</p>
      <div className="tag-row">
        {asset.contentTags.concat(asset.visualTags, asset.styleTags, asset.usageTags).map(tag => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </>
  )
}
